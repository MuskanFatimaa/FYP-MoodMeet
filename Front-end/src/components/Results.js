import React, { useState, useEffect } from 'react';
import modelImage1 from '../assets/images/result1.jpg';
import modelImage2 from '../assets/images/result2.jpg';
import modelImage3 from '../assets/images/result3.jpg';
import model2Image1 from '../assets/images/result4.png';
import model2Image2 from '../assets/images/result5.png';
import model2Image3 from '../assets/images/result6.png';
import model3Image1 from '../assets/images/result7.jpg';
import model3Image2 from '../assets/images/result8.jpg';
import "../assets/style/help.css";

const Results = ({ predictionResult }) => {
  const [activeTab, setActiveTab] = useState('modelPerformance');

  // Model performance data
  const modelStats = [
    {
      name: "PromptTTS Model",
      accuracy: "94%",
      dataset: "kuanhuggingface/PromptTTS_Emotion_Recognition_8k",
      link: "https://huggingface.co/datasets/kuanhuggingface/PromptTTS_Emotion_Recognition_8k",
      stats: {
        "f1-score": "0.93",
        "accuracy": "93%",
        "validation accuracy": "94%",
        "precision": "0.96",
        "recall": "0.93"
      },
      images: [model2Image1, model2Image2, model2Image3]
    },
    {
      name: "SAVEE Model",
      accuracy: "89%",
      dataset: "SAVEE dataset",
      stats: {
        "f1-score": "0.96",
        "accuracy": "96%",
        "validation accuracy": "98.7%",
        "precision": "0.96",
        "recall": "0.96"
      },
      images: [model3Image1, model3Image2]
    },
    {
      name: "CREMA-D Model",
      accuracy: "90%",
      dataset: "CREMA-D dataset",
      stats: {
        "f1-score": "0.79",
        "accuracy": "81%",
        "validation accuracy": "98.7%",
        "precision": "0.87",
        "recall": "0.79"
      },
      images: [modelImage3, modelImage2]
    }
  ];

  // ➡️ Added this tiny helper:
  const emotionLists = {
    cremad: ['Neutral', 'Happy', 'Sad', 'Angry', 'Fear', 'Disgust'],
    savee: ['Neutral', 'Happy', 'Sad', 'Angry', 'Fear', 'Disgust', 'Surprise'],
    prompttts: ['Neutral', 'Happy', 'Sad', 'Angry', 'Fear']
  };

  const labels = predictionResult ? (emotionLists[predictionResult.model_used?.toLowerCase()] || []) : [];

  return (
    <div className="min-h-screen bg-[#24024C] flex flex-col justify-center items-center text-white p-8">
      {/* Tab Navigation */}
      <div className="flex mb-8 border-b border-purple-300 w-full max-w-4xl">
        <button
          className={`py-2 px-6 font-[cursive] text-xl ${activeTab === 'modelPerformance' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white'}`}
          onClick={() => setActiveTab('modelPerformance')}
        >
          Model Performance
        </button>
        <button
          className={`py-2 px-6 font-[cursive] text-xl ${activeTab === 'yourResults' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white'}`}
          onClick={() => setActiveTab('yourResults')}
          disabled={!predictionResult}
        >
          Your Results
        </button>
      </div>

      {activeTab === 'modelPerformance' ? (
        <>
          <h1 className="text-4xl md:text-5xl font-[cursive] text-center mb-6 fontFamily mt-14">
            About The Model's <br /> Performance.
          </h1>

          <div className="text-white py-20 px-6 fontFamily">
            {modelStats.map((model, index) => (
              <div key={index} className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
                {/* Left Column - Stats */}
                <div className="md:w-1/2">
                  <h4 className="text-3xl md:text-4xl font-normal leading-snug mb-6">
                    {model.name} Performance
                  </h4>
                  <div className="text-lg leading-relaxed">
                    <p className="text-5xl font-bold mb-3">{model.accuracy}</p>
                    <p className="text-3xl text-white">
                      validation accuracy<br />
                      the '{model.dataset}'<br />
                      {model.link && (
                        <span className="italic text-sm text-white/80">
                          <a href={model.link} className="help_link">*Dataset link*</a>
                        </span>
                      )}
                      <br /><br />
                      {Object.entries(model.stats).map(([key, value]) => (
                        <React.Fragment key={key}>
                          {key}: {value}<br />
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>

                {/* Right Column - Images */}
                <div className="md:w-1/2 flex flex-col gap-6 items-center">
                  {model.images.map((img, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={img}
                      alt={`Model Output ${imgIndex + 1}`}
                      className="rounded-lg w-full max-w-md shadow-lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Your Results Tab */
        predictionResult && (
          <div className="w-full max-w-4xl p-8 bg-white/10 rounded-xl backdrop-blur-sm">
            <h2 className="text-3xl font-[cursive] text-center mb-8 text-pink-300">
              Your Emotion Analysis Results
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Emotion Summary */}
              <div className="bg-[#3A1B6B] p-6 rounded-lg">
                <h3 className="text-2xl font-light mb-4">Detected Emotion</h3>
                <p className="text-4xl font-bold capitalize text-pink-300">
                  {predictionResult.emotion_label}
                </p>
                <p className="text-xl mt-4">
                  Confidence: {(Math.max(...predictionResult.probabilities[0]) * 100).toFixed(1)}%
                </p>
              </div>

              {/* Confidence Breakdown */}
              <div className="bg-[#3A1B6B] p-6 rounded-lg">
                <h3 className="text-2xl font-light mb-4">Confidence Breakdown</h3>
                <div className="space-y-3">
                  {predictionResult.probabilities[0].map((prob, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="w-32 capitalize">
                        {labels[idx] || 'Unknown'}:
                      </span>
                      <div className="flex-1 bg-white/20 rounded-full h-4">
                        <div
                          className="bg-pink-400 h-4 rounded-full"
                          style={{ width: `${prob * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-16 text-right">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Used */}
            <div className="mt-6 text-center text-lg">
              Analysis performed using: <span className="font-bold text-pink-300">
                {predictionResult.model_used.toUpperCase()} Model
              </span>
            </div>
          </div>
        )
      )}

      {/* Help section remains unchanged */}
      <div className="text-lg md:text-xl space-y-2 text-center fontFamily mt-12">
        <h1>Need Some Help?</h1>
        <h2><a href="#" className="help_link">User Manual</a></h2>
        <h2><a href="#" className="help_link">FAQs</a></h2>
        <h2><a href="#" className="help_link">Relevant Documentation</a></h2>
      </div>
    </div>
  );
};

export default Results;
