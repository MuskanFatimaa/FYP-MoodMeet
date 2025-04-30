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

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Existing Model Configuration ---
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

# Initialize TFLite interpreters
interpreter_map = {}
for model_name, config in MODEL_CONFIG.items():
    try:
        interpreter = tf.lite.Interpreter(model_path=config["path"])
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()[0]
        input_shape = input_details['shape'][1:]
        assert tuple(input_shape) == config["input_shape"], \
            f"{model_name} shape mismatch: {input_shape} vs {config['input_shape']}"
        interpreter_map[model_name] = interpreter
        logger.info(f"Initialized {model_name} interpreter with input shape {config['input_shape']}")
    except Exception as e:
        logger.error(f"Failed to initialize {model_name} interpreter: {str(e)}")
        raise

# Emotion label mappings
EMOTION_LABELS = {
    "cremad": ["neutral", "happy", "sad", "angry", "fear", "disgust"],
    "savee": ["neutral", "happy", "sad", "angry", "fear", "disgust", "surprise"],
    "prompttts": ["neutral", "happy", "sad", "angry", "fear"]
}

# --- Chatbot Initialization with Fallback ---
svm_model = None
gemini_model = None

try:
    # Initialize Gemini (works even without SVM)
    genai.configure(api_key="AIzaSyAFYqA6eizxLbjNbwdArfofuoODXAc44fg")
    gemini_model = genai.GenerativeModel(model_name="models/learnlm-1.5-pro-experimental")
    logger.info("✅ Initialized Gemini model")
    
    # Try loading SVM model
    try:
        with open('svm_emotion_model.pkl', 'rb') as f:
            svm_model = pickle.load(f)
        logger.info("✅ Loaded SVM emotion model")
    except Exception as e:
        logger.warning(f"⚠️ Could not load SVM model: {str(e)}")
        logger.warning("⚠️ Text emotion detection will use voice emotion only")
        
except Exception as e:
    logger.error(f"Failed to initialize AI services: {str(e)}")
    gemini_model = None

# --- Existing Helper Functions ---
def pad_or_truncate(features: np.ndarray, target_length: int) -> np.ndarray:
    """Existing implementation unchanged"""
    if features.shape[1] > target_length:
        return features[:, :target_length]
    else:
        pad_width = ((0, 0), (0, target_length - features.shape[1]))
        return np.pad(features, pad_width, mode='constant')

def preprocess_audio(audio_bytes: bytes, model_name: str) -> np.ndarray:
    """Existing implementation unchanged"""
    config = MODEL_CONFIG[model_name]
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=config["sr"])
    
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
    """Existing implementation unchanged"""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    return interpreter.get_tensor(output_details[0]['index'])

# --- API Endpoints ---
@app.post("/predict")
async def predict(file: UploadFile = File(...), model_name: str = Form(...)):
    """Existing endpoint unchanged"""
    try:
        if model_name not in interpreter_map:
            raise HTTPException(400, detail=f"Unknown model: {model_name}")
        
        audio_bytes = await file.read()
        input_data = preprocess_audio(audio_bytes, model_name)
        prediction = predict_with_interpreter(interpreter_map[model_name], input_data)
        
        return {
            "emotion_index": int(np.argmax(prediction)),
            "emotion_label": EMOTION_LABELS[model_name][np.argmax(prediction)],
            "probabilities": prediction.tolist(),
            "model_used": model_name
        }
    except Exception as e:
        raise HTTPException(400, detail=str(e))

# --- New Chat Endpoints ---
class ChatRequest(BaseModel):
    text: str
    voice_emotion: str

@app.post("/chat")
async def chat_response(request: ChatRequest):
    """New endpoint with fallback handling"""
    if not gemini_model:
        raise HTTPException(503, detail="Chatbot services are currently unavailable")
    
    try:
        # Use voice emotion if SVM fails
        text_emotion = request.voice_emotion
        if svm_model:
            try:
                cleaned_text = re.sub(r'[^\w\s]', '', request.text).lower()
                text_emotion = svm_model.predict([cleaned_text])[0]
            except Exception as e:
                logger.warning(f"SVM prediction failed, using voice emotion: {str(e)}")
        
        prompt = f"""
        The user is currently feeling {request.voice_emotion} (voice analysis).
        Their text suggests: {text_emotion}.
        They said: "{request.text}"
        
        Respond empathetically in 2-3 sentences and provide helpful suggestions.
        """
        
        response = gemini_model.generate_content(prompt)
        return {
            "text_response": response.text,
            "detected_text_emotion": text_emotion,
            "voice_emotion": request.voice_emotion
        }
        
    except Exception as e:
        raise HTTPException(500, detail=f"Chatbot error: {str(e)}")

@app.get("/chatbot/status")
async def chatbot_status():
    """Check service availability"""
    return {
        "svm_available": svm_model is not None,
        "gemini_available": gemini_model is not None,
        "status": "operational" if gemini_model else "degraded"
    }

# --- Existing Endpoints ---
@app.get("/models")
async def list_models():
    """Existing endpoint unchanged"""
    return {
        "available_models": list(interpreter_map.keys()),
        "emotion_labels": EMOTION_LABELS,
        "model_configs": MODEL_CONFIG
    }

@app.get("/test")
async def test_connection():
    """Existing endpoint unchanged"""
    return {"message": "Backend is running!"}