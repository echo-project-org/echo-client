import React from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import MainLogo from './MainLogo'
import MainPage from './MainPage'
import Login from './Login';
import Register from './Register'
import { AnimatePresence } from 'framer-motion'


function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route path="/" exact element={<MainLogo/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/main" element={<MainPage/>} />
        </Routes>
    </AnimatePresence>
    
  )
}

export default AnimatedRoutes