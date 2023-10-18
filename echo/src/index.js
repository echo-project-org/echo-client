import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import EchoProtocol from './echoProtocol';
import Storage from './cache/storage';
import AudioPlayer from './audioPlayer';

let ep = new EchoProtocol();
const storage = new Storage();
const ap = new AudioPlayer();
export { ep, storage, ap };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();