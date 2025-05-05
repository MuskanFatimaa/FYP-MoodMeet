import React from "react";

const MeetMoodIntro = () => {
  return (
    <div className="min-h-screen bg-[#24024C] text-white flex items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-light mb-6">
          <span className="font-serif">Meet</span>
          <span className="font-serif italic">...MoodMeet!</span>
        </h1>
        <p className="text-lg leading-relaxed mb-4 fontFamily">
        MoodMeet is your intelligent emotional companion designed to understand not just what you say, but how you feel. Leveraging advanced Speech Emotion Recognition (SER) technology, MoodMeet analyzes vocal cues like tone, pitch, and rhythm in real-time to detect subtle emotional nuances—whether it's joy, frustration, sadness, or calm. More than just a chatbot, it responds with tailored empathy, offering support, encouragement, or thoughtful engagement based on your emotional state.
        </p>
        <p className="text-lg leading-relaxed fontFamily">
        Built on deep learning frameworks like PyTorch and powered by cloud-based processing, MoodMeet bridges the gap between artificial intelligence and human connection. Whether you're seeking a comforting conversation, mental well-being support, or simply a more intuitive digital interaction, MoodMeet adapts dynamically, making every exchange meaningful. This isn't just technology—it's AI with emotional intelligence, designed to listen, understand, and respond like never before.
        </p>
      </div>
    </div>
  );
};

export default MeetMoodIntro; 
