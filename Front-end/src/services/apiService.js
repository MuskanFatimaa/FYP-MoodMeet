const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ------------------------- */
/*  Existing Functions       */
/* (Remain completely unchanged) */
/* ------------------------- */

// 1. Test backend connection (unchanged)
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/test`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Backend connection test failed:', error);
    throw new Error(`Cannot connect to backend at ${API_URL}. Please ensure: 
      1. Backend server is running
      2. Correct API_URL in .env
      3. No CORS issues`);
  }
};

// 2. Audio buffer to WAV conversion (unchanged)
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const audioBufferToWav = (buffer) => {
  return new Promise((resolve) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * numOfChan * 2, true);

    let offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < channel.length; j++) {
        const sample = Math.max(-1, Math.min(1, channel[j]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    resolve(new Blob([view], { type: 'audio/wav' }));
  });
};

// 3. Audio conversion (unchanged)
const convertToWav = async (audioFile) => {
  if (audioFile.type === 'audio/wav') {
    return audioFile;
  }

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBlob = await audioBufferToWav(audioBuffer);
    
    return new File([wavBlob], `${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`, {
      type: 'audio/wav',
    });
  } catch (error) {
    console.error('Audio conversion failed:', error);
    throw new Error('Unsupported audio format. Please upload MP3, OGG, or WAV.');
  }
};

// 4. Main prediction function (unchanged)
export const predictEmotion = async (audioFile, modelName) => {
  if (!audioFile || !modelName) {
    throw new Error('Both audio file and model name are required');
  }

  try {
    await testBackendConnection();
    const wavFile = await convertToWav(audioFile);
    const formData = new FormData();
    formData.append('file', wavFile);
    formData.append('model_name', modelName);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 
                         errorData.message || 
                         `Server responded with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Try a shorter audio clip.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to server. Please check:
        1. Backend is running at ${API_URL}
        2. No network restrictions
        3. CORS is properly configured`);
    }
    
    throw error;
  }
};

/* ------------------------- */
/*  New Chatbot Functions    */
/* (Added below existing code) */
/* ------------------------- */

/**
 * Checks if chatbot services are available
 * @returns {Promise<{svm_available: boolean, gemini_available: boolean}>}
 */
export const checkChatbotStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/chatbot/status`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Chatbot status check failed:', error);
    return { 
      svm_available: false, 
      gemini_available: false,
      warning: 'Chatbot features temporarily unavailable'
    };
  }
};

/**
 * Sends message to emotion support chatbot
 * @param {string} message - User's text input
 * @param {string} voiceEmotion - Detected emotion from audio prediction
 * @returns {Promise<{text_response: string, detected_text_emotion: string}>}
 */
export const sendChatMessage = async (message, voiceEmotion) => {
  if (!message?.trim()) {
    throw new Error('Message cannot be empty');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message.trim(),
        voice_emotion: voiceEmotion
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Chat service responded with an error');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // User-friendly error messages
    if (error.name === 'AbortError') {
      throw new Error('Chat response timed out. Please try again.');
    }
    
    throw new Error(
      error.message.includes('Failed to fetch') 
        ? 'Cannot connect to chat service. Check your network.'
        : `Chat error: ${error.message}`
    );
  }
};