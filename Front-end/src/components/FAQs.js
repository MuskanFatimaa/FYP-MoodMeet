import React, { useState } from 'react';
import wave from "../assets/images/landscape_wav.png";
const FAQs = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "What Is MoodMeet?",
      answer: "MoodMeet is an AI-powered platform that analyzes speech patterns to identify emotional states. It helps users understand the emotional context behind their communications and improve their emotional intelligence."
    },
    {
      id: 2,
      question: "How does it work?",
      answer: "Our system uses advanced machine learning models (CNN-LSTM hybrid and LSTM+DistilHuBERT) to analyze audio input. These models examine both the content and delivery of speech to identify emotional patterns and provide insights about mood and emotional state."
    },
    {
      id: 3,
      question: "Is my voice data stored or shared?",
      answer: "Your privacy is important to us. Voice data is processed securely and not stored long-term unless you explicitly opt-in. We never share your voice recordings with third parties, and all analysis is done within our secure infrastructure."
    },
    {
      id: 4,
      question: "Do I need to download anything?",
      answer: "No, MoodMeet is a web-based application that works directly in your browser. There's no need to download or install any software to use our service."
    },
    {
      id: 5,
      question: "Who is this for?",
      answer: "MoodMeet is designed for anyone interested in improving their emotional communication. This includes professionals looking to enhance workplace communications, individuals working on emotional intelligence, therapists, educators, and anyone wanting to better understand how they express emotions through speech."
    }
  ];

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div className="relative w-full py-12 px-4 overflow-hidden">
      
      <img 
              src={wave} 
        alt="Wave background" 
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-[#2d1a45] mb-12">FAQS</h1>
        
        <div className="space-y-4">
          {faqData.map((faq) => (
            <div key={faq.id} className="w-full">
              <button
                onClick={() => toggleQuestion(faq.id)}
                className={`w-full text-left p-4 text-xl font-light transition-colors duration-300 
                  ${faq.id % 2 === 0 
                    ? 'bg-white text-[#2d1a45] hover:bg-gray-100' 
                    : `${faq.id === 3 ? 'bg-[#b29bc0]' : 'bg-[#cbbbd8]'} text-white hover:bg-opacity-90`
                  }`}
              >
                {faq.question}
              </button>
              
              {activeQuestion === faq.id && (
                <div className="bg-white p-4 shadow-md animate-fadeIn">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;