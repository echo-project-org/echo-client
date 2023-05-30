import '../index.css'
import "../css/login.css"

import { useState, useEffect, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Alert, Button, createTheme, Snackbar } from '@mui/material'
import { useNavigate } from "react-router-dom";
import BackButton from './BackButton';

import imgLogo from "../img/headphones.svg"

var api = require('../api')

const theme = createTheme({
    palette: {
      primary: {main: '#2b192e',},
      secondary: {main: '#2b192e',},
    }
});


const Login = () => {
    let navigate = useNavigate(); 
    
    var [loginError, setLoginError] = useState(false);
    var [vertical, setVertical] = useState('bottom');
    var [horizontal, sethHorizontal] = useState('left');
    var [open, setOpen] = useState(false);
    var [message, setMessage] = useState("Error message");

    const showError = (msg) => {
        //Show error message
        setLoginError(true);
        setOpen(true);
        setMessage(msg);
    }
    
    const hideError = () => {
        //Hide error message
        setOpen(false);
        setLoginError(false);
    }
    
    const handleClose = () => {
        //Close error message handler
        setOpen(false);
        setLoginError(false);
    }

    const checkCredentials = async () => {
        var email = document.getElementById('usernameBox').value
        var password = document.getElementById('passwordBox').value

        if(email === "" || password === ""){
            showError("All fields must be populated!");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            showError("Invalid email address!");
        } else {
            hash(email + "@" + password)
                .then((hashed) => {
                    api.call('auth/login', "POST", { email, password: hashed })
                        .then((data) => {
                            console.log(data);
                            hideError();
                            localStorage.setItem("id", data.json.id);
                            localStorage.setItem("username", data.json.username);
                            localStorage.setItem("email", data.json.email);
                            localStorage.setItem("token", data.json.token);
                            localStorage.setItem("refreshToken", data.json.refreshToken);
                            navigate("/");
                        })
                        .catch((err) => {
                            showError(err.message);
                        });
                });
        }
    }

    const hash = (string) => {
        const utf8 = new TextEncoder().encode(string);
        return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray
            .map((bytes) => bytes.toString(16).padStart(2, '0'))
            .join('');
          return hashHex;
        });
      }

    useEffect(() => {

    }, [])

    return (
        <motion.div 
            className='splashScreen'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
        
            <BackButton/>
            <div className="loginForm" style={{ height: "28rem" }}>
                <div className="boxedLogoContainer">
                    <img className="boxedLogo" src={imgLogo} alt='echoLogo'/>
                    <div className="ripple"></div>
                </div>
                <h1>Login</h1>
                <input
                    id="usernameBox"
                    type="text"
                    className="input"
                    placeholder="Email"
                    value="test@example.com"
                />
                <input
                    id="passwordBox"
                    type="password"
                    className="input"
                    placeholder="Password"
                    value="test"
                />

                <Button theme={theme} variant="outlined" onClick={checkCredentials}>Login</Button>
            </div>

            <Snackbar 
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                onClose={handleClose}
                message={message}
                key={vertical + horizontal}
            >
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </motion.div>
    )
}

Login.defaultProps = {
}

export default Login;