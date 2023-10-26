import React from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion'

// import MainLogo from './MainLogo'
import MainPage from './MainPage';
import MainPageServer from './MainPageServer'
import Login from './Login';
import Register from './Register'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode='exitBeforeEnter'>
      <Routes location={location} key={location.pathname}>
        <Route path="/" exact element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<MainPageServer />} />
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes