// src/App.js
import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Footer from './components/Footer';
import MeetMoodIntro from './components/MeetMoodIntro';
import ModelSelector from './components/ModelSelector';
import Results from './components/Results';
import { useUser } from './context/UserContext';
import Instructions from './components/Instructions';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Definition from './components/Definition';
import Features from './components/Features';
import FAQs from './components/FAQs';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    const { user } = useUser();
    const [predictionResult, setPredictionResult] = useState(null);

    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<MeetMoodIntro />} />
                <Route 
                    path="/results" 
                    element={<Results predictionResult={predictionResult} />} 
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected route for /chat */}
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ModelSelector onPrediction={setPredictionResult} />
                        </ProtectedRoute>
                    }
                />
                
                {/* Redirect to home for unknown routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* Public Components on Home Page */}
            <Definition />
            <Instructions />
            <Features />
            <FAQs />
            <Footer />
        </Router>
    );
};

export default App;

