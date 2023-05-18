import './App.css';
import { useState, useEffect } from 'react'
import { BrowserRouter} from "react-router-dom";
import AnimatedRoutes from './components/AnimatedRoutes';

function App() {
  useEffect(() => {

  }, [])
  
  return (
    <div className="App">
      <BrowserRouter>
        <AnimatedRoutes/>
      </BrowserRouter>
    </div>
  );
}

export default App;
