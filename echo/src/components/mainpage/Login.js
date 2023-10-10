import { useState } from 'react'
import { motion } from 'framer-motion'
import { Alert, Button, Snackbar } from '@mui/material'
import { useNavigate } from "react-router-dom";

import BackButton from '../settings/BackButton';
import imgLogo from "../../img/headphones.svg"

import { storage } from "../../index";
var api = require('../../api')

const Login = () => {
  let navigate = useNavigate();

  var [open, setOpen] = useState(false);
  var [message, setMessage] = useState("Error message");

  const showError = (msg) => {
    //Show error message
    setOpen(true);
    setMessage(msg);
  }

  const hideError = () => {
    //Hide error message
    setOpen(false);
  }

  const handleClose = () => {
    //Close error message handler
    setOpen(false);
  }

  const checkCredentials = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    var email = document.getElementById('usernameBox').value
    var password = document.getElementById('passwordBox').value

    if (email === "" || password === "") {
      showError("All fields must be populated!");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      showError("Invalid email address!");
    } else {
      hash(email + "@" + password)
        .then((hashed) => {
          api.call('auth/login', "POST", { email, password: hashed })
            .then((data) => {
              hideError();
              storage.set("id", data.json.id);
              storage.set("name", data.json.name);
              storage.set("email", data.json.email);
              storage.set("userImage", data.json.img);
              storage.set("online", data.json.online);
              storage.set("token", data.json.token);
              storage.set("refreshToken", data.json.refreshToken);

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

  return (
    <motion.div
      className='splashScreen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BackButton />
      <div className="customForm" style={{ height: "28rem" }}>
        <div className="boxedLogoContainer">
          <img className="boxedLogo" src={imgLogo} alt='echoLogo' />
          <div className="ripple"></div>
        </div>
        <h1>Login</h1>
        <input
          id="usernameBox"
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
        <Button variant="contained" onClick={checkCredentials}>Login</Button>
      </div>

      <Snackbar
        open={open}
        onClose={handleClose}
        message={message}
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