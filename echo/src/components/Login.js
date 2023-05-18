import '../index.css'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Alert, Button, createTheme, Snackbar, TextField } from '@mui/material'
import { useNavigate } from "react-router-dom";
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
        var usrName = document.getElementById('usernameBox').value
        var psw = document.getElementById('passwordBox').value

        if(usrName === "" || psw === ""){
            showError("All fields must be populated!");
        } else {
            var hashed = await hash(usrName + "@" + psw);
            
            const res = await api.call('authenticateUser/' + hashed);
            const data = await res.json();
            if(res.ok){
                hideError();
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userNick", data.nick);
                navigate("/");
            } else {
                showError("Username or password do not match!");
            }
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
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
        >

        <div className="loginForm">
            <h1>Login</h1>
            <TextField
                sx={{input: {color: '#2b192e'}}}
                required
                id="usernameBox"
                variant="standard"
                label="Username"
                error={loginError}
            />
            <TextField
                required
                sx={{input: {color: '#2b192e'}}}
                id="passwordBox"
                variant="standard"
                type="password"
                label="Password"
                onKeyPress={(e) => {
                    if(e.key === 'Enter') {
                        //If key pressed is Enter
                        checkCredentials();
                    }
                }}
                error={loginError}
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