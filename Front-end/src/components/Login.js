import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {useUser} from '../context/UserContext';
import "../assets/style/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const {setUser} = useUser();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>From Audio, To Emotion.</h2>
        <h1>MoodMeet.</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">login</button>
        </form>
        <div className="signup-text">
          new here? <a onClick={() => navigate("/signup")}>Sign up now!</a>
        </div>
      </div>

      
    </div>
  );
};

export default Login;
