import '../index.css'
import React from 'react'
import Button from '@mui/material/Button'
import { ButtonGroup } from '@mui/material'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MinimizeIcon from '@mui/icons-material/Minimize';

const api = require('../api')
const ep = require('../echoProtocol')
const ar = require('../audioReceiver')
const at = require('../audioTransmitter')
const { ipcRenderer } = window.require('electron');

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
});

function WindowControls({ muted, audioMuted }) {
    const closeApp = async () => {
        at.stopAudioStream();
        ar.stopOutputAudioStream();
        var nickname = localStorage.getItem("userNick");
        await api.call('setOnline/' + nickname + '/F');
        
        ipcRenderer.send("exitApplication", true);
    }

    const toggleFullscreen = async () => {
        ipcRenderer.send("toggleFullscreen", true);
    }

    const minimize = async () => {
        ipcRenderer.send("minimize", true);
    }

    return (
        <div className='roomControl'>
            <ThemeProvider theme={theme}>
                <ButtonGroup variant='text' size="small" className='windowControls'>
                    <Button onClick={minimize}>
                        <MinimizeIcon fontSize="small"/>
                    </Button>
                    <Button onClick={toggleFullscreen}>
                        <FullscreenIcon fontSize="small"/>
                    </Button>
                    <Button onClick={closeApp}>
                        <CloseIcon fontSize="small"/>
                    </Button>
                </ButtonGroup>
            </ThemeProvider>
        </div>


    )
}

WindowControls.defaultProps = {
    muted: false,
    audioMuted: false
}

export default WindowControls