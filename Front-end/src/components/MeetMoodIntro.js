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
          Welcome to MoodMeet, an innovative chatbot designed to bridge the gap between
          technology and human emotions. By leveraging advanced Speech Emotion Recognition
          (SER) technology powered by deep learning, MoodMeet understands the emotions
          conveyed through your speech in real-time. Whether you're feeling happy, sad,
          angry, or calm, MoodMeet identifies your sentiments and provides thoughtful,
          personalized responses tailored to your needs.
        </p>
        <p className="text-lg leading-relaxed fontFamily">
          Our mission is to revolutionize human-computer interaction by integrating empathy into
          digital systems. From offering mental health support to enhancing customer service
          experiences, MoodMeet is here to make interactions meaningful and supportive. With
          cutting-edge frameworks like PyTorch, HuggingFace, and Librosa, combined with cloud-
          powered deployment, MeetMood is more than a chatbot—it's your personalized emotional
          assistant.
        </p>
      </div>
    </div>
  );
};

export default MeetMoodIntro; 
