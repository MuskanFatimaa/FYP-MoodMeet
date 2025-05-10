from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import librosa
import io
import re
import pickle
import google.generativeai as genai
from pydantic import BaseModel
import sys
import logging
import tempfile
import os
from pydub import AudioSegment  # Added for audio conversion
import subprocess
from typing import Optional

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FFmpeg Configuration ---
def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], 
                      check=True, 
                      stdout=subprocess.PIPE, 
                      stderr=subprocess.PIPE)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

FFMPEG_AVAILABLE = check_ffmpeg()
logger.info(f"FFmpeg available: {FFMPEG_AVAILABLE}")

if not FFMPEG_AVAILABLE:
    logger.warning("FFmpeg not found in PATH. Some audio conversions may fail.")

# CORS Configuration (unchanged)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Configuration (unchanged) ---
MODEL_CONFIG = {
    "cremad": {
        "path": "crema_model.tflite",
        "input_shape": (200, 26),
        "sr": 16000,
        "feature_type": "mfcc_delta",
        "n_mfcc": 13,
        "n_mels": 26
    },
    "savee": {
        "path": "savee_model.tflite",
        "input_shape": (32, 32),
        "sr": 22050,
        "feature_type": "mel"
    },
    "prompttts": {
        "path": "prompttts_model.tflite",
        "input_shape": (40, 1),
        "sr": 16000,
        "feature_type": "mfcc_stats"
    }
}

# Initialize TFLite interpreters (unchanged)
interpreter_map = {}
for model_name, config in MODEL_CONFIG.items():
    try:
        interpreter = tf.lite.Interpreter(model_path=config["path"])
        interpreter.allocate_tensors()
        interpreter_map[model_name] = interpreter
        logger.info(f"Initialized {model_name} interpreter")
    except Exception as e:
        logger.error(f"Failed to initialize {model_name} interpreter: {str(e)}")
        raise

# Emotion label mappings (unchanged)
EMOTION_LABELS = {
    "cremad": ["neutral", "happy", "sad", "angry", "fear", "disgust"],
    "savee": ["neutral", "happy", "sad", "angry", "fear", "disgust", "surprise"],
    "prompttts": ["neutral", "happy", "sad", "angry", "fear"]
}

# --- Chatbot Initialization (unchanged) ---
svm_model = None
gemini_model = None

try:
    genai.configure(api_key="AIzaSyAFYqA6eizxLbjNbwdArfofuoODXAc44fg")
    gemini_model = genai.GenerativeModel(model_name="models/learnlm-1.5-pro-experimental")
    logger.info("✅ Initialized Gemini model")
    
    try:
        with open('svm_emotion_model.pkl', 'rb') as f:
            svm_model = pickle.load(f)
        logger.info("✅ Loaded SVM emotion model")
    except Exception as e:
        logger.warning(f"⚠️ Could not load SVM model: {str(e)}")
except Exception as e:
    logger.error(f"Failed to initialize AI services: {str(e)}")

# --- Enhanced Audio Processing Functions ---
def convert_to_wav(audio_bytes: bytes, file_extension: str) -> bytes:
    """Convert various audio formats to WAV format"""
    try:
        # Create temporary input file
        with tempfile.NamedTemporaryFile(suffix=f".{file_extension}", delete=False) as tmp_input:
            tmp_input.write(audio_bytes)
            tmp_input_path = tmp_input.name

        # Create temporary output file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_output:
            tmp_output_path = tmp_output.name

        # Convert using pydub
        audio = AudioSegment.from_file(tmp_input_path)
        audio.export(tmp_output_path, format="wav")
        
        # Read converted file
        with open(tmp_output_path, 'rb') as f:
            wav_bytes = f.read()
        
        return wav_bytes
    except Exception as e:
        logger.error(f"Audio conversion error: {str(e)}")
        raise HTTPException(400, detail=f"Could not convert audio to WAV format: {str(e)}")
    finally:
        # Clean up temporary files
        for path in [tmp_input_path, tmp_output_path]:
            try:
                if path and os.path.exists(path):
                    os.unlink(path)
            except Exception as e:
                logger.warning(f"Could not delete temp file {path}: {str(e)}")

def pad_or_truncate(features: np.ndarray, target_length: int) -> np.ndarray:
    """Pad or truncate audio features to target length (unchanged)"""
    if features.shape[1] > target_length:
        return features[:, :target_length]
    else:
        pad_width = ((0, 0), (0, target_length - features.shape[1]))
        return np.pad(features, pad_width, mode='constant')

def preprocess_audio(audio_bytes: bytes, model_name: str) -> np.ndarray:
    """Preprocess audio with format conversion support"""
    config = MODEL_CONFIG[model_name]
    
    try:
        # Create temporary file with delete=False
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Now safely load after the file is closed
        y, sr = librosa.load(tmp_path, sr=config["sr"])
        os.remove(tmp_path)  # Clean up
    except Exception as e:
        logger.error(f"Error loading audio: {str(e)}")
        raise HTTPException(400, detail="Could not process audio file")

    # Rest of your existing preprocessing logic...
    if model_name == "cremad":
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, n_mels=26)
        delta = librosa.feature.delta(mfcc)
        features = np.vstack([mfcc, delta])
        features = pad_or_truncate(features, target_length=200)
        features = features.T
        
    elif model_name == "savee":
        mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=32, hop_length=512)
        mel_db = librosa.power_to_db(mel)
        features = pad_or_truncate(mel_db, target_length=32)
        features = features.T
        
    elif model_name == "prompttts":
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        features = np.concatenate([mfcc.mean(axis=1), mfcc.std(axis=1)])
        features = features.reshape(40, 1)
    
    features = np.expand_dims(features, axis=0)
    return features.astype(np.float32)

def predict_with_interpreter(interpreter, input_data):
    """Unchanged interpreter prediction function"""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    return interpreter.get_tensor(output_details[0]['index'])

# --- Enhanced API Endpoints ---
@app.post("/predict")
async def predict(file: UploadFile = File(...), model_name: str = Form(...)):
    try:
        if model_name not in interpreter_map:
            raise HTTPException(400, detail=f"Unknown model: {model_name}")
        
        # Read audio file
        audio_bytes = await file.read()
        if len(audio_bytes) == 0:
            raise HTTPException(400, detail="Empty audio file received")

        # Get file extension and check if conversion is needed
        file_extension = file.filename.split('.')[-1].lower()
        supported_extensions = ['wav', 'mp3', 'm4a', 'aac', 'flac', 'ogg', 'webm']
        
        if file_extension not in supported_extensions:
            raise HTTPException(400, detail=f"Unsupported file format: {file_extension}")
        
        # Convert to WAV if needed
        if file_extension != 'wav':
            logger.info(f"Converting {file_extension} to WAV format")
            audio_bytes = convert_to_wav(audio_bytes, file_extension)

        # Process and predict
        input_data = preprocess_audio(audio_bytes, model_name)
        prediction = predict_with_interpreter(interpreter_map[model_name], input_data)
        
        return {
            "emotion_index": int(np.argmax(prediction)),
            "emotion_label": EMOTION_LABELS[model_name][np.argmax(prediction)],
            "probabilities": prediction.tolist(),
            "model_used": model_name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(500, detail="Error processing audio")

# --- Rest of your endpoints remain unchanged ---
class ChatRequest(BaseModel):
    text: str
    voice_emotion: str

@app.post("/chat")
async def chat_response(request: ChatRequest):
    if not gemini_model:
        raise HTTPException(503, detail="Chatbot services unavailable")
    
    try:
        text_emotion = request.voice_emotion
        if svm_model:
            try:
                cleaned_text = re.sub(r'[^\w\s]', '', request.text).lower()
                text_emotion = svm_model.predict([cleaned_text])[0]
            except Exception as e:
                logger.warning(f"SVM prediction failed: {str(e)}")

        prompt = f"""
        The user is currently feeling {request.voice_emotion} (voice analysis).
        Their text suggests: {text_emotion}.
        They said: "{request.text}"
        
        Respond empathetically in 2-3 sentences.
        """
        
        response = gemini_model.generate_content(prompt)
        return {
            "text_response": response.text,
            "detected_text_emotion": text_emotion,
            "voice_emotion": request.voice_emotion
        }
    except Exception as e:
        raise HTTPException(500, detail=f"Chatbot error: {str(e)}")

@app.get("/models")
async def list_models():
    return {
        "available_models": list(interpreter_map.keys()),
        "emotion_labels": EMOTION_LABELS
    }

@app.get("/test")
async def test_connection():
    return {"message": "Backend is running!"}