// Footer.js
import React from "react";
import Waveform from "../assets/images/pngtree-sound-waves-equalizer-audio-radio-signal-music-recording-vector-png-image_6678910 3.png";

const Footer = () => {
  return (
    <footer className="bg-[#250f59] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-start gap-12">
        
        <div>
          <img
            src={Waveform}
            alt="Waveform"
            className="w-72 md:w-[850px]" 
          />
        </div>

        <div className="text-center md:text-left">
          <p className="text-2xl font-light mb-3">Need Some Help?</p>
          <p className="text-xl hover:underline cursor-pointer mb-1">User Manual</p>
          <p className="text-xl hover:underline cursor-pointer">Contact Us</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
