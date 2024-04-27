import React, { useEffect } from 'react'
import { ButtonGroup, Button } from '@mui/material'
import { Close, Fullscreen, Minimize } from '@mui/icons-material';

import { ep, storage } from "@root/index";
import StylingComponents from '@root/StylingComponents';

const api = require('@lib/api');
const { ipcRenderer } = window.require('electron');
const { error, info } = require('@lib/logger');

function WindowControls({ }) {
  const closeApp = async () => {
    info("Closing application");
    api.call("users/status", "POST", { id: sessionStorage.getItem('id'), status: "0" })
      .then(() => {
        ep.requestAppClose();
      })
      .catch((err) => {
        error("Error setting user offline", err);
        ipcRenderer.send("exitApplication", true);
      });
  }
  const toggleFullscreen = async () => {
    info("Toggling fullscreen");
    ipcRenderer.send("toggleFullscreen", true);
  }
  const minimize = async () => {
    // remote.BrowserWindow.getFocusedWindow().minimize();
    info("Minimizing window");
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
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(230, 10, 10, .8)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = null}
        // onMouseDown={(e) => e.currentTarget.style.backgroundColor = "rgba(230, 10, 10, .8)"}
        // onMouseUp={(e) => e.currentTarget.style.backgroundColor = null}
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