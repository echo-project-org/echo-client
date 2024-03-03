import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Alert, Button, Snackbar } from '@mui/material'
import { useNavigate } from "react-router-dom";

import imgLogo from "../../img/headphones.svg"
import StyledComponents from '../../StylingComponents';

var api = require('../../lib/api')

const Register = () => {
  let navigate = useNavigate();
  
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

  const handleLogin = () => {
    navigate("/login");
  }

  const checkCredentials = async (e) => {
    if (e.key !== "Enter" && e.target.localName !== "button") return;

    var name = document.getElementById('usernameBox').value;
    var psw = document.getElementById('passwordBox').value;
    var psw2 = document.getElementById('passwordBox2').value;
    var email = document.getElementById('emailBox').value;

    // check if email address is valid
    if (name === "" || psw === "" || psw2 === "" || email === "") {
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
                hideError();
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

  return (
    <motion.div
      className='splashScreen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StyledComponents.Register.StyledForm>
        <StyledComponents.Register.StyledBoxedLogo>
          <img src={imgLogo} alt='echoLogo' />
          <StyledComponents.Register.StyledRipple />
        </StyledComponents.Register.StyledBoxedLogo>
        <h1>Create account</h1>
        <input
          id="usernameBox"
          type="text"
          className="input"
          placeholder="Username"
          onKeyDown={checkCredentials}
        />
        <input
          id="emailBox"
          type="text"
          className="input"
          placeholder="Email"
          onKeyDown={checkCredentials}
        />
        <input
          id="passwordBox"
          type="password"
          className="input"
          placeholder="Password"
          onKeyDown={checkCredentials}
        />
        <input
          id="passwordBox2"
          type="password"
          className="input"
          placeholder="Repeat password"
          onKeyDown={checkCredentials}
        />
        <StyledComponents.Register.StyledButtonPrimary variant="outlined" onClick={checkCredentials}>Register</StyledComponents.Register.StyledButtonPrimary>
        <StyledComponents.Register.StyledButtonSecondary variant="outlined" onClick={handleLogin}>Go to Login</StyledComponents.Register.StyledButtonSecondary>
      </StyledComponents.Register.StyledForm>

      <Snackbar
        open={open}
        onClose={handleClose}
        message={message}
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