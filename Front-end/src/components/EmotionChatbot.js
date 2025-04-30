// EmotionChatbot.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmotionChatbot = ({ predictedEmotion }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with a welcome message based on predicted emotion
  useEffect(() => {
    const welcomeMessages = {
      happy: "I see you're feeling happy! What's making you smile today?",
      sad: "I notice you might be feeling down. Would you like to talk about it?",
      angry: "I sense some frustration. Want to vent or find solutions?",
      neutral: "How are you feeling today? I'm here to chat.",
      fear: "It seems you might be anxious. Would sharing help?",
      disgust: "I detect some strong feelings. Want to discuss what's bothering you?"
    };
    
    setMessages([{
      text: welcomeMessages[predictedEmotion] || "How can I help you today?",
      sender: 'bot'
    }]);
  }, [predictedEmotion]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: userInput, sender: 'user' }];
    setMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      // Call your Flask backend (you'll need to set this up)
      const response = await axios.post('http://localhost:5000/chat', {
        text: userInput,
        emotion: predictedEmotion
      });

      // Add bot response
      setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble responding. Please try again.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-light text-pink-500 mb-4">Emotion Support Chat</h3>
      
      {/* Chat messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' 
              ? 'bg-pink-100 ml-auto' 
              : 'bg-gray-100'}`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="p-3 rounded-lg bg-gray-100 max-w-xs">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="flex">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={isTyping}
          className="bg-pink-500 text-white px-4 py-2 rounded-r-lg hover:bg-pink-600 disabled:bg-pink-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default EmotionChatbot;