import './App.css';
import { useState, useEffect } from 'react'
import { BrowserRouter, HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/AnimatedRoutes';
import CloseButton from './components/CloseButton';

function App() {
  useEffect(() => {

  }, [])
  
  return (
    <div className="App">
      <CloseButton className="closeButton"></CloseButton> 
      <HashRouter>
        <AnimatedRoutes/>
      </HashRouter>
    </div>
  );
}

export default App;
