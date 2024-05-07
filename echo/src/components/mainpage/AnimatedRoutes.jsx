import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from 'framer-motion'

// import MainLogo from './MainLogo'
import MainPage from '@views/MainPage';
import MainPageServer from '@views/MainPageServer'
import Login from '@views/Login';
import Register from '@views/Register'
import Updating from '@views/Updating';
import { ee } from "@root/index";

const { ipcRenderer } = window.require('electron');
const api = require('@lib/api');
const { error, log, info } = require('@lib/logger');

function AnimatedRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [newVersion, setNewVersion] = useState("0.0.0");
  const [releaseNotes, setReleaseNotes] = useState("No release notes available");

  useEffect(() => {
    info("[AnimatedRoutes] path: " + location.pathname)
    const appCloseRequested = () => {
      info("[AnimatedRoutes] App close requested");
      //exit from room and close connection
      api.call("users/status", "POST", { id: sessionStorage.getItem('id'), status: "0" })
        .then(res => {
          if (location.pathname === "/main") {
            ee.appClosing();
          } else {
            ee.canSafelyCloseApp();
          }
        })
        .catch(err => {
          error("Failed setting user to offline", err);
          ee.canSafelyCloseApp();
        });
    }

    ipcRenderer.on("updateAvailable", (e, msg) => {
      //TODO ep.closeConnection();
      log("update available", msg.version)
      setNewVersion(msg.version);
      if (msg.releaseNotes) setReleaseNotes(msg.releaseNotes);
      navigate("/updating");
    });

    ipcRenderer.on("goToMainPage", () => {
      navigate("/");
    });

    ipcRenderer.on("appClose", (event, arg) => {
      appCloseRequested();
    });

    ee.on("requestAppClose", "AnimatedRoutes.requestAppClose", () => {
      appCloseRequested();
    });

    ee.on("canSafelyCloseApp", "AnimatedRouter.canSafelyCloseApp", () => {
      ipcRenderer.send("exitApplication", true);
    });

    return () => {
      ipcRenderer.removeAllListeners("updateAvailable");
      ipcRenderer.removeAllListeners("goToMainPage");
      ipcRenderer.removeAllListeners("appClose");
      ee.releaseGroup("AnimatedRoutes.requestAppClose");
      ee.releaseGroup("AnimatedRouter.canSafelyCloseApp");
    }
  }, [navigate, location])

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path="/" exact element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<MainPageServer />} />
        <Route path="/updating" element={<Updating version={newVersion} releaseNotes={releaseNotes} />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes