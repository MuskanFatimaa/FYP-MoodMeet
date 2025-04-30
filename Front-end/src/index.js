import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { UserProvider } from "./context/UserContext"; // 👈 Import it
const root = ReactDOM.createRoot(document.getElementById('hellow'));

root.render(
  // <React.StrictMode>
  //  <BrowserRouter>
  //      <App/>
  //  </BrowserRouter>
  // </React.StrictMode>
  <React.StrictMode>
    <UserProvider>
    <App />
    </UserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
