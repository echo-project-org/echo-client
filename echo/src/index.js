import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

process.env.API_URL = 'http://localhost:6980/';
process.env.SIGNAL_SERVER = 'http://kury.ddns.net:6983/';
process.env.ICE_SERVERS = {
  username: 'echo',
  credential: 'echo123',
  urls: ["turn:kury.ddns.net:6984"]
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();