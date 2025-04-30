// components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useUser } from '../context/UserContext';

export default function Header() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    const handleChatClick = (e) => {
        e.preventDefault();
        if (user) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    };

    return (
        <header className="flex justify-between items-center px-6 py-4 absolute top-0 w-full z-10 bg-white">
            <div className="text-[32px] font-semibold text-[#2f1365] font-serif tracking-tight">
                MoodMeet.
            </div>

            <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-[#2f1365] hover:text-[#9e56b8] font-semibold">Home</Link>
                <a
                    href="/chat"
                    className="text-[#2f1365] hover:text-[#9e56b8] font-semibold"
                    onClick={handleChatClick}>
                    Chat
                </a>
                <Link to="/about" className="text-[#2f1365] hover:text-[#9e56b8] font-semibold">About</Link>
                <Link to="/results" className="text-[#2f1365] hover:text-[#9e56b8] font-semibold">About Models</Link>
            </nav>

            <div className="space-x-5 flex justify-evenly">
                {!user ? (
                    <>
                        <button
                            className="bg-[#b6b6f7] text-white px-10 py-2 rounded-lg text-sm hover:opacity-90 transition"
                            onClick={() => navigate('/login')}>
                            login
                        </button>
                        <button
                            className="bg-[#9e56b8] text-white px-10 py-2 rounded-lg text-sm hover:opacity-90 transition"
                            onClick={() => navigate('/signup')}>
                            signup
                        </button>
                    </>
                ) : (
                    <button
                        className="bg-[#9e56b8] text-white px-10 py-2 rounded-lg text-sm hover:opacity-90 transition"
                        onClick={handleLogout}>
                        logout
                    </button>
                )}
            </div>
        </header>
    );
}
