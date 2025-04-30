import React from 'react';
import mind from '../assets/images/mind.png';
import '../assets/style/instructions.css';
const Instructions = () => {
    return (
        <div className="instructions-container py-12 px-6 bg-white">
            <div className="row">
                <div className="col_1">
                    <h1 className="title mb-5 text-6xl">
                        How MoodMeet Works
                    </h1>
                    <p className="subtitle mb-5 text-3xl">
                        It’s simple—talk, and we’ll do the rest.
                    </p>
                    <p className="highlight mb-10 text-3xl">
                        MoodMeet turns speech into emotional clarity in just a
                        few steps.
                    </p>
                </div>
                <div className="col_2 ">
                    <img
                        src={mind}
                        alt="Brain analysis illustration"
                        className="w-72"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="instruction-box">
                    <h2 className="instruction-title">Speak Your Mind.</h2>
                    <p className="instruction-text">
                        Record your voice or upload an audio clip.
                    </p>
                </div>
                <div className="instruction-box">
                    <h2 className="instruction-title">Let MoodMeet Feel It.</h2>
                    <p className="instruction-text">
                        Our AI decodes your emotional state in real-time.
                    </p>
                </div>
                <div className="instruction-box">
                    <h2 className="instruction-title">Understand Yourself.</h2>
                    <p className="instruction-text">
                        Get instant mood insights and patterns.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Instructions;
