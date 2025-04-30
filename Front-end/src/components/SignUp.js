import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../assets/style/signUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {   
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User registered successfully!");
      navigate("/"); // Redirect to login
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  };

  return (
    <div className="signup-container">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <h2>From Audio, To Emotion.</h2>
        <h1>MoodMeet.</h1>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="signup-box">
          <h1>Sign Up</h1>
          <form onSubmit={handleSignUp}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          <div className="switch-link">
            Already have an account?{" "}
            <a onClick={() => navigate("/login")}>Login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
