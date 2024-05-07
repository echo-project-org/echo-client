import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Storage from '@cache/storage';
import AudioPlayer from '@lib/audioPlayer';
import EchoEvents from '@lib/EchoEvents';
import CacheManager from '@cache/CacheManager';

// const sessionStorage = new Storage('session');

// const { ipcRenderer } = window.require('electron');
// const _logger = (type, args) => {
//   ipcRenderer.send('log', { type, message: args });
// }
// console.log = (args) => _logger('log', args);
// console.error = (args) => _logger('error', args);
// console.warn = (args) => _logger('warn', args);
// console.info = (args) => _logger('info', args);
// console.debug = (args) => _logger('debug', args);

const storage = new Storage();
const ee = new EchoEvents();
const cm = new CacheManager();
const ap = new AudioPlayer(storage.get('soundQueuesVolume') || 0.6);

export { cm, ee, storage, ap };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();