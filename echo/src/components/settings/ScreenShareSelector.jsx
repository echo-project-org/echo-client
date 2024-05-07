import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from 'react';
import { StopScreenShare, ScreenShare } from '@mui/icons-material';

import { ee } from "@root/index";
import ScreenShareOption from './ScreenShareOption';

const { error, warn, info } = require('@lib/logger');

const modalStyle = {
  position: "relative",
  top: "5%",
  margin: "auto",
  height: '80%',
  width: '70%',
  bgcolor: 'var(--mui-palette-backgroundSolid-main)',
  color: 'var(--mui-palette-text-light)',
  overflow: 'auto',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '.4rem',
};

function ScreenShareSelector() {
  let [screenSharing, setScreenSharing] = useState(false);
  let [windowsDevices, setWindowsDevices] = useState([]);
  let [screenDevices, setScreenDevices] = useState([]);
  let [modalOpen, setModalOpen] = useState(false);
  let [deviceInterval, setDeviceInterval] = useState(null);
  let [errorMessageShow, setErrorMessageShow] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

  const handleModalOpen = () => {
    info("[ScreenShareSelector] Opening screen share modal")
    setModalOpen(true);
  }

  const handleModalClose = () => {
    info("[ScreenShareSelector] Closing screen share modal")
    stopGetDevicesInterval();
    setModalOpen(false);
  }

  const showError = (msg) => {
    info("[ScreenShareSelector] Showing error message: " + msg);
    setErrorMessage(msg);
    setErrorMessageShow(true);
  }

  const closeErrorMessage = () => {
    info("[ScreenShareSelector] Closing error message");
    setErrorMessageShow(false);
  }

  const startGetDevicesInterval = () => {
    setDeviceInterval(setInterval(() => {
      info("[ScreenShareSelector] Getting devices")
      ep.getVideoDevices().then((devices) => {
        if (devices.length === 0) {
          showError("No devices found");
          stopGetDevicesInterval();
          return;
        }
        const screens = [];
        const windows = [];
        devices.forEach(device => {
          if (device.id.includes("screen")) {
            screens.push(device);
          } else {
            windows.push(device);
          }
        });
        setWindowsDevices(windows);
        setScreenDevices(screens);
      });
    }, 2000));
  }

  const stopGetDevicesInterval = () => {
    info("[ScreenShareSelector] Stopping get devices interval")
    clearInterval(deviceInterval);
    setDeviceInterval(null);
  }

  useEffect(() => {
    ee.on("exitedFromRoom", "ScreenShareSelector.exitedFromRoom", () => {
      setScreenSharing(false);
    });

    ee.on("screenShareStopped", "ScreenShareSelector.screenShareStopped", () => {
      setScreenSharing(false);
    });

    return () => {
      ee.off("exitedFromRoom", "ScreenShareSelector.exitedFromRoom");
      ee.off("screenShareStopped", "ScreenShareSelector.screenShareStopped");
    }
  }, [])

  const handleClick = (event) => {
    info("[ScreenShareSelector] Screen share button clicked")
    if (!ep.isAudioFullyConnected()) {
      error("Audio is not fully connected yet. Please wait a few seconds and try again.");
      return;
    }

    let user = ep.getUser();
    if (user && user.currentRoom !== "0") {
      if (screenSharing) {
        ep.stopScreenSharing();
        setScreenSharing(false);
      } else {
        ep.getVideoDevices().then((devices) => {
          if (devices.length === 0) {
            showError("No devices found");
            return;
          }
          const screens = [];
          const windows = [];
          devices.forEach(device => {
            if (device.id.includes("screen")) {
              screens.push(device);
            } else {
              windows.push(device);
            }
          });
          setWindowsDevices(windows);
          setScreenDevices(screens);
          startGetDevicesInterval();
        });
        handleModalOpen();
      }
    } else {
      warn("You must be in a room to share your screen")
    }

  };
  const deviceSelected = (deviceId) => {
    info("[ScreenShareSelector] Device selected: " + deviceId)
    ep.startScreenSharing(deviceId);
    setScreenSharing(true);
    handleModalClose();
  }

  return (
    <div>
      <Tooltip title="Share Your Screen" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
        <Button onClick={handleClick}>
          {!screenSharing ? <ScreenShare /> : <StopScreenShare />}
        </Button>
      </Tooltip>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
      >
        <Zoom in={modalOpen}>
          <Box sx={modalStyle}>
            <Typography sx={{ marginBottom: "2%" }} variant="h3" className='noselect'>
              Share your screen
            </Typography>

            <div className='screenshareModalSubdiv'>
              <Grid container spacing={2}>
                {
                  screenDevices.map((device, id) => (
                    <Grid item key={id} xs={6} sx={{ alignContent: "center", textAlign: "center" }}>
                      <ScreenShareOption key={id} device={device} clickHandler={deviceSelected} />
                    </Grid>
                  ))
                }
              </Grid>
            </div>

            <div className='screenshareModalSubdiv'>
              <Grid container spacing={2}>
                {
                  windowsDevices.map((device, id) => (
                    <Grid item key={id} xs={6} sx={{ alignContent: "center", textAlign: "center" }}>
                      <ScreenShareOption key={id} device={device} clickHandler={deviceSelected} />
                    </Grid>
                  ))
                }
              </Grid>
            </div>
            <Snackbar
              open={errorMessageShow}
              onClose={closeErrorMessage}
              message={errorMessage}
            >
              <Alert onClose={closeErrorMessage} severity="error" sx={{ width: '100%' }}>
                {errorMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Zoom>
      </Modal>
    </div>
  )
}

export default ScreenShareSelector