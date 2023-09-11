import { Button, ButtonGroup } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react'
import { useNavigate } from "react-router-dom";

import { ep } from "../../index";

var api = require('../../api');

const theme = createTheme({
  palette: {
    primary: { main: '#f5e8da', },
    secondary: { main: '#ce8ca5', },
  },
});

const AuthenticatedUserButtons = ({ visibility }) => {
  let navigate = useNavigate();

  const logout = async () => {
    localStorage.removeItem("id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("userImage");
    localStorage.removeItem("token");
    localStorage.removeItem("online");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userImage");

    // EEEEEEEEWWWWWWWWWWWWWWW
    // but why??
    window.location.reload();
  }

  const enterServer = async () => {
    // TODO: check the initial status of user (maybe get it from the login form?)
    // and check if we need to update it or not
    api.call('users/status', "POST", { id: localStorage.getItem('id'), status: "1" })
      .then((res) => {
        ep.openConnection(localStorage.getItem('id'));
        navigate("/main");

        ep.addUser({
          id: localStorage.getItem('id'),
          name: localStorage.getItem('name'),
          img: localStorage.getItem('userImage'),
          online: localStorage.getItem('online'),
          roomId: 0
        }, true);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  if (!visibility) return null;

  return (
    <ThemeProvider theme={theme}>
      <ButtonGroup
        size='large'
        orientation='vertical'
        disableElevation
        variant="text"
        className="loginButtons"
      >
        <Button onClick={enterServer}>Enter</Button>
        <Button onClick={logout}>Logout</Button>
      </ButtonGroup>
    </ThemeProvider>
  )
}

AuthenticatedUserButtons.defaultProps = {
  visibility: true,
  nickname: ""
}

export default AuthenticatedUserButtons