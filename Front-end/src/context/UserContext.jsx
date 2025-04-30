// src/context/UserContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../firebase";

// Create the context
const UserContext = createContext();

// Export the hook to use context easily
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

//   const logout = () => signOut(auth);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
