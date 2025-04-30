import React from 'react';
import backgroundWave from '../assets/images/diagonal_wav.png'; // Replace with your actual wave asset path

export default function LandingPage() {
    return (
        <div
            className="relative min-h-screen font-sans bg-white overflow-hidden"
            style={{
                backgroundImage: `url(${backgroundWave})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
            <div className='pt-22 mt-20 px-40'>
            <span className="text-[132px] block leading-tight font-semibold text-[#793F94]">Talk.</span>
            <span className="text-[132px] block leading-tight font-semibold text-[#ff2994]">Feel.</span>
            </div>
            <main className="flex flex-col items-center justify-center text-center px-4 pt-26 pb-16">
                
                <h1 className='text-[132px] text-[#793F94]'>
                    Connect.<span className=' text-[#2f1365]'> MoodMeet.</span>
                </h1>
                    

                <button className="mt-6 w-[140px] h-[40px] bg-[#ff2994] text-white font-semibold rounded shadow hover:opacity-90 transition mx-auto">
                    Start Now
                </button>

        
            </main>
        </div>
    );
}
