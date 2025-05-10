import React, { useState, useRef } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const ModelSelector = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [record, setRecord] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const fileInputRef = useRef(null);

  const models = [
    {
      id: 'cremad',
      name: 'CREMA-D',
      description: 'Emotion model trained on the CREMA-D dataset, which contains audio clips where actors express different emotions like happiness, anger, and sadness. Its diverse and realistic, helping the system learn from various voices and expressions',
      icon: '🎤'
    },
    {
      id: 'savee',
      name: 'SAVEE',
      description: 'Emotion model trained on SAVEE, A smaller dataset with audio and video clips of actors showing emotions like fear, joy, and surprise. Its useful for testing how well the system can understand emotional speech from specific speakers.',
      icon: '🎧'
    },
    {
      id: 'prompttts',
      name: 'PromptTTS',
      description: 'Model trained on A synthetic dataset created using AI voice models that "act out" different emotions like happy or sad. Its great for training the system when real emotional recordings are limited.',
      icon: '🔊'
    }
  ];

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setTextInput('');
    setRecordedBlob(null);
    setPrediction(null);
    setChatMessages([]);
  };

  const startRecording = () => {
    setRecord(true);
    setRecordedBlob(null);
    setPrediction(null);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onStop = (recordedBlob) => {
    console.log("onStop called with:", recordedBlob);
    const blob = new Blob([recordedBlob.blob], { type: 'audio/webm' }); // safer fallback
    setRecordedBlob({
      blob: blob,
      blobURL: recordedBlob.blobURL
    });
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const blobObject = {
        blob: file,
        blobURL: URL.createObjectURL(file)
      };
      setRecordedBlob(blobObject);
      setTextInput(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!selectedModel) {
      alert('Please select a model first!');
      return;
    }
    if (!recordedBlob && !textInput.trim()) {
      alert('Please record audio or enter text first!');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (recordedBlob) {
        console.log("Sending recorded blob:", recordedBlob);
        const formData = new FormData();
        formData.append('file', recordedBlob.blob, 'recording.wav');
        formData.append('model_name', selectedModel.id);
        response = await axios.post('http://127.0.0.1:8000/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/predict_text', {
          text: textInput,
          model_name: selectedModel.id
        });
      }

      setPrediction(response.data);

      const welcomeMessages = {
        happy: "I see you're feeling happy! What's making you smile today?",
        sad: "I notice you might be feeling down. Would you like to talk about it?",
        angry: "I sense some frustration. Want to vent or find solutions?",
        neutral: "How are you feeling today? I'm here to chat.",
        fear: "It seems you might be anxious. Would sharing help?",
        disgust: "I detect some strong feelings. Want to discuss what's bothering you?"
      };

      setChatMessages([{
        text: welcomeMessages[response.data.emotion_label] || "How can I help you today?",
        sender: 'bot'
      }]);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing your request');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!textInput.trim() || !prediction) return;

    try {
      setChatMessages(prev => [...prev, {
        text: textInput,
        sender: 'user'
      }]);

      const response = await axios.post('http://127.0.0.1:8000/chat', {
        text: textInput,
        voice_emotion: prediction.emotion_label
      });

      setChatMessages(prev => [...prev, {
        text: response.data.text_response,
        sender: 'bot'
      }]);

      setTextInput('');
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble responding.",
        sender: 'bot'
      }]);
    }
  };

  return (
    <div className="w-full bg-white flex flex-col items-center py-8">
      <h1 className="text-4xl font-light text-pink-500 mb-10">Choose a Model</h1>

      <div className="flex justify-center w-full px-4 max-w-6xl">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => handleModelSelect(model)}
            className={`w-1/3 h-80 mx-2 p-8 bg-[#24024C] text-white cursor-pointer rounded-lg 
              transition-all duration-300 transform hover:scale-105 hover:shadow-xl
              ${selectedModel?.id === model.id
                ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                : 'shadow-md hover:shadow-lg'}`}
          >
            <div className="text-3xl mb-2">{model.icon}</div>
            <h2 className="text-2xl font-light mb-4">{model.name}</h2>
            <p className="text-sm">{model.description}</p>
            {selectedModel?.id === model.id && (
              <div className="mt-4 text-green-300">✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      {selectedModel && (
        <div className="w-full max-w-2xl mt-8 px-4 animate-fadeIn">
        {/* Added supported formats notice */}
    <div className="text-center text-gray-500 text-sm mb-4">
      Supported audio formats: MP3, WAV, M4A, AAC, FLAC, OGG
    </div>
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 px-6 py-4 flex items-center justify-between transform transition-all duration-300 hover:shadow-2xl">
            <div className="relative">
              <button
                className="text-3xl font-bold text-black hover:text-purple-700 transition-colors duration-200"
                onClick={handleFileUpload}
              >
                ＋
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
            </div>

            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={record ? "Recording..." : (recordedBlob ? "Audio ready" : "Type or record audio...")}
              className="flex-grow text-center text-black text-lg font-light placeholder-gray-400 bg-transparent border-none outline-none mx-4"
              disabled={record}
              onKeyPress={(e) => e.key === 'Enter' && (prediction ? handleChatSubmit() : handleSubmit())}
            />

            {!record && !recordedBlob ? (
              <button
                className="text-2xl text-black hover:text-purple-700 transition-colors duration-200"
                onClick={startRecording}
              >
                🎤
              </button>
            ) : record ? (
              <button
                className="text-2xl text-black hover:text-purple-700 transition-colors duration-200"
                onClick={stopRecording}
              >
                ⏹️
              </button>
            ) : (
              <button
                className="text-2xl text-black hover:text-purple-700 transition-colors duration-200"
                onClick={prediction ? handleChatSubmit : handleSubmit}
                disabled={loading}
              >
                {loading ? '⏳' : '➡️'}
              </button>
            )}
          </div>

          {/* Keep ReactMic mounted during stop */}
          {(record || recordedBlob === null) && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <ReactMic
                record={record}
                className="w-full h-12"
                onStop={onStop}
                strokeColor="#000000"
                backgroundColor="#f0f0f0"
                echoCancellation={true}
                noiseSuppression={true}
              />
            </div>
          )}

          {recordedBlob && !record && (
            <div className="mt-4">
              <audio src={recordedBlob.blobURL} controls className="w-full" />
            </div>
          )}

          {prediction && (
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg text-center animate-fadeIn">
              <h3 className="text-2xl font-light mb-2">Analysis Result</h3>
              <div className="text-4xl mb-2">
                {prediction.emotion_label === 'happy' && '😊'}
                {prediction.emotion_label === 'sad' && '😢'}
                {prediction.emotion_label === 'angry' && '😠'}
                {prediction.emotion_label === 'neutral' && '😐'}
                {prediction.emotion_label === 'fear' && '😨'}
                {prediction.emotion_label === 'disgust' && '🤢'}
                {prediction.emotion_label === 'surprise' && '😲'}
              </div>
              <p className="text-xl font-medium text-pink-600 mb-1">
                {prediction.emotion_label.charAt(0).toUpperCase() + prediction.emotion_label.slice(1)}
              </p>
            </div>
          )}

          {prediction && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="h-40 overflow-y-auto mb-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-xs ${msg.sender === 'user'
                      ? 'bg-pink-100 ml-auto'
                      : 'bg-gray-100'}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(styleTag);

export default ModelSelector;
