import '../../index.css'
import { useState, useEffect } from 'react'
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
    },
    input: {
        color: '#2b192e'
    },
});


const Register = () => {
    let navigate = useNavigate(); 
    var [vertical, setVertical] = useState('bottom');
    var [horizontal, setHorizontal] = useState('left');
    var [alertType, setAlertType] = useState('error');
    var [open, setOpen] = useState(false);
    var [message, setMessage] = useState("Error message");


    const showError = (msg) => {
        setOpen(true);
        setMessage(msg);
        setAlertType('error');
    }

    const showSuccess = (msg) => {
        setOpen(true);
        setMessage(msg);
        setAlertType('success');
    }
    
    const hideError = () => {
        //Hide error message
        setOpen(false);
    }
    
    const handleClose = () => {
        //Close error message handler
        setOpen(false);
    }

    const checkCredentials = async () => {
        var name = document.getElementById('usernameBox').value;
        var psw = document.getElementById('passwordBox').value;
        var psw2 = document.getElementById('passwordBox2').value;
        var email = document.getElementById('emailBox').value;

        // check if email address is valid
        if(name === "" || psw === "" || psw2 === "" || email === ""){
            showError("Invalid email address!");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            //If user has not filled the entire form
            showError("Invalid email address!")
        } else {
            if (psw === psw2) {
                //if passwords match send them to the api
                //fist check if hash exists
                hash(email + "@" + psw)
                    .then((hashed) => {
                        api.call('auth/register', "POST", { password: hashed, name, email })
                            .then((data) => {
                                showSuccess(data.message);
                                setTimeout(() => navigate('/login'), 3500);
                            })
                            .catch((err) => {
                                showError(err.message);
                            });
                    });
            } else {
                // passwords don't match
                showError("Passwords do not match!");
            }        
        }
    }

    const hash = (string) => {
        //Create sha256 hash from string
        //Used to hash username@password for auth
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
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
        >
        
        <BackButton/>
        <div className="loginForm" style={{ height: "38rem" }}>
            <div className="boxedLogoContainer">
                <img className="boxedLogo" src={imgLogo} alt='echoLogo'/>
                <div className="ripple"></div>
            </div>
            <h1>Create account</h1>
            <input
                id="usernameBox"
                type="text"
                className="input"
                placeholder="Username"
            />
            <input
                id="emailBox"
                type="text"
                className="input"
                placeholder="Email"
            />
            <input
                id="passwordBox"
                type="password"
                className="input"
                placeholder="Password"
            />
            <input
                id="passwordBox2"
                type="password"
                className="input"
                placeholder="Repeat password"
            />
            <Button theme={theme} variant="outlined" onClick={checkCredentials}>Register</Button>
        </div>

        <Snackbar 
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            message={message}
            key={vertical + horizontal}
        >
            <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
        </motion.div>
    )
}

Register.defaultProps = {
}

export default Register;