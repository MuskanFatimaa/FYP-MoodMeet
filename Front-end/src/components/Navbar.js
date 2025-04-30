import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useUser } from "../context/UserContext"; 
import "../assets/style/navbar.css";

const Navbar = () => {  
  const navigate = useNavigate();
const {setUser} = useUser()
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear kndo
      navigate("/login"); // Redirect kndo login te
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="custom-navbar">
      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/about">About</Link>
        <Link to="/results">Results</Link>
        {/* <button onClick={() => navigate("/signup")}>SignIn</button> */}
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
