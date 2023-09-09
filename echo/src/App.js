import './App.css';
import { useEffect } from 'react'
import { HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/mainpage/AnimatedRoutes';
import WindowControls from './components/header/WindowControls';

function App() {
  useEffect(() => { }, []);
  
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
