import '../../css/header.css'

import React from 'react'
import Button from '@mui/material/Button'
import { ButtonGroup } from '@mui/material'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import MinimizeIcon from '@mui/icons-material/Minimize';

const api = require('../../api');
const ep = require('../../echoProtocol');
const { ipcRenderer } = window.require('electron');

const theme = createTheme({
  palette: {
    primary: { main: '#f5e8da', },
    secondary: { main: '#ce8ca5', },
  },
});

function WindowControls({ muted, audioMuted }) {
  const closeApp = async () => {
    ep.closeConnection();
    var nickname = localStorage.getItem("name");
    api.call('setOnline/' + nickname + '/F/0');

    ipcRenderer.send("exitApplication", true);
  }

  const toggleFullscreen = async () => {
    ipcRenderer.send("toggleFullscreen", true);
  }

  const minimize = async () => {
    // remote.BrowserWindow.getFocusedWindow().minimize();
    ipcRenderer.send("minimize", true);
  }

  return (
    <div className='noDrag'>
      <ThemeProvider theme={theme}>
        <ButtonGroup variant='text' size="small" className='windowControls'>
          <Button onClick={minimize}>
            <MinimizeIcon fontSize="small" />
          </Button>
          <Button onClick={toggleFullscreen}>
            <FullscreenIcon fontSize="small" />
          </Button>
          <Button onClick={closeApp}>
            <CloseIcon fontSize="small" />
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