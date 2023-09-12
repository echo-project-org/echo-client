import '../../css/header.css'

import React from 'react'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import { ButtonGroup, Button } from '@mui/material'
import { Close, Fullscreen, Minimize } from '@mui/icons-material';

import { ep } from "../../index";

const api = require('../../api');
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
          <Button onClick={minimize} disableRipple>
            <Minimize fontSize="small" />
          </Button>
          <Button onClick={toggleFullscreen} disableRipple>
            <Fullscreen fontSize="small" />
          </Button>
          <Button
            onClick={closeApp}
            disableRipple
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(230, 10, 10, .8)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = null}
            onMouseDown={(e) => e.target.style.backgroundColor = "rgba(230, 10, 10, .8)"}
            onMouseUp={(e) => e.target.style.backgroundColor = null}
          >
            <Close fontSize="small" />
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