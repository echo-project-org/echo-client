import React, { useEffect } from 'react'
import { ButtonGroup, Button } from '@mui/material'
import { Close, Fullscreen, Minimize } from '@mui/icons-material';

import { ep, storage } from "@root/index";
import StylingComponents from '@root/StylingComponents';

const api = require('@lib/api');
const { ipcRenderer } = window.require('electron');
 
function WindowControls({ }) {
  const closeApp = async () => {
    ep.closeConnection();
    api.call("users/status", "POST", { id: sessionStorage.getItem('id'), status: "0" })
      .then(() => {
        ipcRenderer.send("exitApplication", true);
      })
      .catch((err) => {
        console.error(err);
        ipcRenderer.send("log", { type: "error", message: err });
        ipcRenderer.send("exitApplication", true);
      });
  }
  const toggleFullscreen = async () => {
    ipcRenderer.send("toggleFullscreen", true);
  }
  const minimize = async () => {
    // remote.BrowserWindow.getFocusedWindow().minimize();
    ipcRenderer.send("minimize", true);
  }

  return (
    <StylingComponents.WindowControls.StyledButtonGroup variant='text' size="small">
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
      // onMouseDown={(e) => e.target.style.backgroundColor = "rgba(230, 10, 10, .8)"}
      // onMouseUp={(e) => e.target.style.backgroundColor = null}
      >
        <Close fontSize="small" />
      </Button>
    </StylingComponents.WindowControls.StyledButtonGroup>
  )
}

WindowControls.defaultProps = {
  muted: false,
  audioMuted: false
}

export default WindowControls