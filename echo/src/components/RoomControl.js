import '../index.css'
import React from 'react'
import Button from '@mui/material/Button'
import { ButtonGroup } from '@mui/material'
import KeyboardVoiceRoundedIcon from '@mui/icons-material/KeyboardVoiceRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import { createTheme } from '@mui/material/styles';
import HeadsetOffRoundedIcon from '@mui/icons-material/HeadsetOffRounded';
import { ThemeProvider } from '@emotion/react';
import LogoutIcon from '@mui/icons-material/Logout';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import { useNavigate } from 'react-router-dom';
import ScreenShare from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
var api = require('../api')

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
});

function RoomControl({ muted, audioMuted, screenSharing, stopAudioStream }) {
    let navigate = useNavigate();

    const exitRoom = async () => {
        //Notify api
        var nickname = localStorage.getItem("userNick");
        const res = await api.call('setOnline/' + nickname + '/F');
        stopAudioStream();
        if (!res.ok) {
            console.error("Could not set user as offline");
        }

        navigate("/");
    }

    return (
        <div className='roomControl'>
            <ThemeProvider theme={theme}>
                <ButtonGroup variant='text'>
                    <Button>
                        {!muted ? <KeyboardVoiceRoundedIcon /> : <MicOffRoundedIcon />}
                    </Button>
                    <Button>
                        {!audioMuted ? <HeadsetMicRoundedIcon /> : <HeadsetOffRoundedIcon />}
                    </Button>
                    <Button>
                        {!screenSharing ? <ScreenShare /> : <StopScreenShareIcon />}
                    </Button>
                    <Button onClick={exitRoom}>
                        <LogoutIcon />
                    </Button>
                </ButtonGroup>
            </ThemeProvider>
        </div>


    )
}

RoomControl.defaultProps = {
    muted: false,
    audioMuted: false
}

export default RoomControl