import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPs828Z8G7fSamWdsCAr9xrdSuq0K37OU",
  authDomain: "moodmeet-be072.firebaseapp.com",
  projectId: "moodmeet-be072",
  storageBucket: "moodmeet-be072.appspot.com",
  messagingSenderId: "792153521497",
  appId: "1:792153521497:web:e7fc60a50b18e6d42ea048",
};



// const analytics = getAnalytics(app);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export {app, onAuthStateChanged};