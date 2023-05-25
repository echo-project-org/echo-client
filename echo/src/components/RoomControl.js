import '../index.css'
import { useState } from 'react'
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
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
const api = require('../api')
const at = require('../audioTransmitter')
const ar = require('../audioReceiver')
// const ep = require('../echoProtocol')

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
});

function RoomControl({ screenSharing }) {
    const [muted, setMuted] = useState(false);
    const [deaf, setDeaf] = useState(false);

    let navigate = useNavigate();

    const exitRoom = () => {
        //Notify api
        var nickname = localStorage.getItem("userNick");
        api.call('setOnline/' + nickname + '/F')
            .then(res => {
                // at.startInputAudioStream();
                ar.stopOutputAudioStream();
                at.stopAudioStream();
                if (!res.ok) console.error("Could not set user as offline");
                navigate("/");
            });
    }

    const muteMic = () => {
        at.toggleMute();
        setMuted(!muted);
    }

    const deafHeadphones = () => {
        muteMic()
        setDeaf(!deaf)
    }

    return (
        <div className='roomControl'>
            <ThemeProvider theme={theme}>
                <ButtonGroup variant='text'>
                    <Button onClick={muteMic}>
                        {!muted ? <KeyboardVoiceRoundedIcon /> : <MicOffRoundedIcon />}
                    </Button>
                    <Button onClick={deafHeadphones}>
                        {!deaf ? <HeadsetMicRoundedIcon /> : <HeadsetOffRoundedIcon />}
                    </Button>
                    <Button>
                        {!screenSharing ? <ScreenShareIcon /> : <StopScreenShareIcon />}
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