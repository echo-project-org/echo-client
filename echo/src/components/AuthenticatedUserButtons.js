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

const AuthenticatedUserButtons = ({ visibility, nickname}) => {
    let navigate = useNavigate();

    const logout = async () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userNick");

        window.location.reload();

    }

    const enterRoom = async () => {
        api.call('setOnline/' + nickname + '/T/1')
            .then((res) => {
                if (res.ok) {
                    ep.openConnection(localStorage.getItem('userId'));
                    navigate("/main");
                } else {
                    console.error("Could not set user as online");
                }
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