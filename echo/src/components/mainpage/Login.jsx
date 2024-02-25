import { useState } from 'react'
import { motion } from 'framer-motion'
import { Alert, Button, Snackbar } from '@mui/material'
import { useNavigate } from "react-router-dom";

import imgLogo from "../../img/headphones.svg"

import { storage } from "../../index";
import StyledComponents from '../../StylingComponents';

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

  const handleRegister = () => {
    navigate("/register");
  }

  const checkCredentials = async (e) => {
    if (e.key !== "Enter" && e.target.localName !== "button") return;

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
              sessionStorage.setItem("id", data.json.id);
              sessionStorage.setItem("name", data.json.name);
              sessionStorage.setItem("email", data.json.email);
              sessionStorage.setItem("userImage", data.json.img);
              storage.set("status", data.json.status);
              storage.set("online", data.json.online);
              storage.set("token", data.json.token);
              storage.set("email", data.json.email);

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
      <StyledComponents.Login.StyledForm>
        <StyledComponents.Login.StyledBoxedLogo>
          <img src={imgLogo} alt='echoLogo' />
          <StyledComponents.Register.StyledRipple />
        </StyledComponents.Login.StyledBoxedLogo>
        <h1>Login</h1>
        <input
          id="usernameBox"
          type="text"
          className="input"
          placeholder="Email"
          defaultValue={storage.get("email") || ""}
          onKeyDown={checkCredentials}
        />
        <input
          id="passwordBox"
          type="password"
          className="input"
          placeholder="Password"
          onKeyDown={checkCredentials}
        />
        <StyledComponents.Login.StyledButtonPrimary variant="contained" onClick={checkCredentials}>Login</StyledComponents.Login.StyledButtonPrimary>
        <StyledComponents.Login.StyledButtonSecondary variant="contained" onClick={handleRegister}>Go to Register</StyledComponents.Login.StyledButtonSecondary>
      </StyledComponents.Login.StyledForm>

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