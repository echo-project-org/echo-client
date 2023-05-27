import './App.css';
import { useState, useEffect } from 'react'
import { HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/AnimatedRoutes';
import CloseButton from './components/WindowControls';
import WindowControls from './components/WindowControls';

function App() {
  useEffect(() => {
  }, [])
  
  return (
    <div className="App">
      <div className="appWrapper">
        <div className="topBar">
          <WindowControls/>
        </div>
        <div className="animatedRoutes">
          <HashRouter>
            <AnimatedRoutes/>
          </HashRouter>
        </div>
      </div>
      
      <script src="/socket.io/socket.io.js"></script>
    </div>
  );
}

export default App;
