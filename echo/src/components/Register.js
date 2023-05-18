import '../index.css'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Alert, Button, createTheme, Snackbar, TextField, withStyles } from '@mui/material'
import { useNavigate, BrowserRouter } from "react-router-dom";

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
    var [registerError, setRegisterError] = useState(false);
    var [vertical, setVertival] = useState('bottom');
    var [horizontal, sethHorizontal] = useState('left');
    var [open, setOpen] = useState(false);
    var [message, setMessage] = useState("Error message");


    const showError = (msg) => {
        //Show error message
        setRegisterError(true);
        setOpen(true);
        setMessage(msg);
    }
    
    const hideError = () => {
        //Hide error message
        setOpen(false);
        setRegisterError(false);
    }
    
    const handleClose = () => {
        //Close error message handler
        setOpen(false);
        setRegisterError(false);
    }

    const checkCredentials = async () => {
        var usrName = document.getElementById('usernameBox').value
        var psw = document.getElementById('passwordBox').value
        var psw2 = document.getElementById('passwordBox2').value
        var usrImg = "";

        if(usrName == "" || psw == "" || psw2==""){
            //If user has not filled the entire form
            showError("All fields must be populated!")
        } else {
            if(psw === psw2){
                //if passwords match send them to the api
                //fist check if hash exists
                var hashed = await hash(usrName + "@" + psw);
                //TODO replace this so it verifies that the nickname is available fist
                //(nick must be unique in db)
                const res = await fetch('https://timspik.ddns.net/authenticateUser/' + hashed);
                const data = await res.json();
                if(res.ok){
                    //if api returns 200 OK
                    if(data.id == null){
                        //Can create account
                        hideError();
                        //TODO API NEEDS TO BE EDITED TO ACCEPT THIS REQUEST
                        const res = await fetch('https://timspik.ddns.net/addUser/' + usrName + "/" + usrImg + "/" + hashed);
                        const data = await res.json();
                        if(res.ok){
                            //TODO account made successfully, save stuff to cookies

                            //redirect to loading page
                            navigate("/");
                        } else {
                            //Api errored out!
                            showError("Unable to create account! Api error.");
                        }
                    } else {
                        //hash already present in db
                        showError("User already exists!")
                    }
                } else {
                    //If api errors out
                    showError("Api errored out!");
                }
    
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

        <div className="loginForm">
            <h1>Register</h1>
            <TextField
                sx={{input: {color: '#2b192e'}}}
                required
                id="usernameBox"
                variant="standard"
                label="Username"
            />
            <TextField
                required
                sx={{input: {color: '#2b192e'}}}
                id="passwordBox"
                variant="standard"
                type="password"
                label="Password"
                error={registerError}
            />
            <TextField
                required
                sx={{input: {color: '#2b192e'}}}
                id="passwordBox2"
                variant="standard"
                type="password"
                label="Repeat password"
                onKeyPress={(e) => {
                    if(e.key == 'Enter') {
                        //If key pressed is Enter
                        checkCredentials();
                    }
                }}
                error={registerError}
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
            <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
        </motion.div>
    )
}

Register.defaultProps = {
}

export default Register;