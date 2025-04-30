import React from 'react';
import background from '../assets/images/diagonal_wav.png';
import cloud from '../assets/images/cloud.png';
import mic from '../assets/images/mic.png';
import speaker from '../assets/images/speaker.png';

export default function Features() {
    return (
        <div className="relative bg-white w-full h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background diagonal image */}
            <div className="absolute w-full h-full z-10">
                <img
                    src={background}
                    alt="Background Design"
                    className="w-full h-full object-cover opacity-40"
                />
            </div>

            <h1 className="text-8xl font-bold text-pink-600">Key Features</h1>
            <p className="text-gray-600 mt-2 text-center text-xl">
                Made to understand you — one word at a time.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 px-8 ">
                <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg">
                    <img
                        src={speaker}
                        alt="Deep Learning Icon"
                        className="w-32 h-32 mb-4"
                    />
                    <h1 className="text-xl font-medium text-gray-800">
                        Built On <br />
                        Deep <br /> Learning Models
                    </h1>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg">
                    <img
                        src={mic}
                        alt="Emotion Detection Icon"
                        className="w-20 h-15 mb-4"
                    />
                    <h1 className="text-xl font-medium text-gray-800">
                        Real Time <br /> Emotion <br /> Detection
                    </h1>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-lg">
                    <img
                        src={cloud}
                        alt="Self Awareness Icon"
                        className="w-32 h-32 mb-4"
                    />
                    <h1 className="text-xl font-medium text-gray-800">
                        Designed To <br /> Boost Your <br /> Emotional Awareness
                    </h1>
                </div>
            </div>
        </div>
    );
}
