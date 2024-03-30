import React, { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from 'framer-motion'

// import MainLogo from './MainLogo'
import MainPage from './MainPage';
import MainPageServer from './MainPageServer'
import Login from './Login';
import Register from './Register'
import Updating from './Updating';
import { ep } from "@root/index";

const { ipcRenderer } = window.require('electron');

function AnimatedRoutes() {
  const navigate = useNavigate();
  const [newVersion, setNewVersion] = React.useState("0.0.0");
  const [downloadPercentage, setDownloadPercentage] = React.useState(2);
  const [releaseNotes, setReleaseNotes] = React.useState("No release notes available");
  const [bps, setBps] = React.useState(0);
  const location = useLocation();

  useEffect(() => {
    ipcRenderer.on("updateAvailable", (e, msg) => {
      ep.closeConnection();
      console.log("update available", msg.version)
      setNewVersion(msg.version);
      if (msg.releaseNotes) setReleaseNotes(msg.releaseNotes);
      navigate("/updating");
    });

    ipcRenderer.on("downloadProgress", (e, msg) => {
      setDownloadPercentage(msg.percent);
      //convert bytes to kilobytes
      setBps(Math.round(msg.bps / 1024));
      //if location is not updating, navigate to updating
      if (location.pathname !== "/updating") {
        navigate("/updating");
      }
    });
    
    return () => {
      ipcRenderer.removeAllListeners("updateAvailable");
      ipcRenderer.removeAllListeners("downloadProgress");
    }
  }, [navigate, location])
  
  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path="/" exact element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<MainPageServer />} />
        <Route path="/updating" element={<Updating version={newVersion} releaseNotes={releaseNotes} downloadPercentage={downloadPercentage} bps={bps} />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes