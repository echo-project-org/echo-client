import { Button, ButtonGroup } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react'
import { useNavigate } from "react-router-dom";

const ep = require('../echoProtocol');
var api = require('../api')

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
});

const AuthenticatedUserButtons = ({ visibility = false, nickname }) => {
    let navigate = useNavigate();

    const logout = async () => {
        localStorage.removeItem("id");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // EEEEEEEEWWWWWWWWWWWWWWW
        window.location.reload();
    }

    const enterRoom = async () => {
        // TODO: check the initial status of user (maybe get it from the login form?)
        // and check if we need to update it or not
        api.call('users/status', "POST", { id: localStorage.getItem('id'), status: 1 })
            .then((res) => {
                ep.openConnection(localStorage.getItem('id'));
                navigate("/main");
            })
            .catch((err) => {
                console.log(err.message);
            });
    }
    if (!visibility) return null
    return (
        <ThemeProvider theme={theme}>
            <ButtonGroup
                size='large'
                orientation='vertical'
                disableElevation
                variant="text"
                className="loginButtons"
            >
                <Button onClick={enterRoom}>Enter</Button>
                <Button onClick={logout}>Logout</Button>
            </ButtonGroup>
        </ThemeProvider>
    )
}

AuthenticatedUserButtons.defaultProps = {
    visibility: true
}

export default AuthenticatedUserButtons