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

import muteSound from "../audio/mute.mp3";
import unmuteSound from "../audio/unmute.mp3";
import deafSound from "../audio/deaf.mp3";
import undeafSound from "../audio/undeaf.mp3";

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

    const computeAudio = (isDeaf) => {
        if (isDeaf)
            if (!muted) {
                const audio = new Audio(muteSound);
                audio.volume = 0.6;
                audio.play();
            } else {
                const audio = new Audio(unmuteSound);
                audio.volume = 0.6;
                audio.play();
            }
        else
            if (!deaf) {
                const audio = new Audio(deafSound);
                audio.volume = 0.6;
                audio.play();
            } else {
                const audio = new Audio(undeafSound);
                audio.volume = 0.6;
                audio.play();
            }
    }

    const undeafOnMute = () => { setDeaf(false); }
    const muteOnDeaf = () => { setMuted(true); computeAudio(false); }
    const unmuteOnDeaf = () => { setMuted(false); computeAudio(false); }
    const muteAndDeaf = () => { setMuted(true); setDeaf(true); computeAudio(false); }

    const muteMic = () => {
        if (muted) undeafOnMute();
        at.toggleMute();
        setMuted(!muted);
        if (muted && deaf) computeAudio(false)
        if (muted && !deaf) computeAudio(true)
        if (!muted && !deaf) computeAudio(true)
    }

    const deafHeadphones = () => {
        if (!muted) muteOnDeaf()
        else if (muted && !deaf) muteAndDeaf()
        else unmuteOnDeaf();
        setDeaf(!deaf);
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