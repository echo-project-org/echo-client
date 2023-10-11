import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { useEffect, useState } from 'react';
import { StopScreenShare, ScreenShare } from '@mui/icons-material';

import { ep } from "../../index";
import ScreenShareOption from './ScreenShareOption';

const modalStyle = {
  position: "relative",
  top: "5%",
  margin: "auto",
  height: '80%',
  width: '70%',
  bgcolor: 'var(--mui-palette-background-main)',
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

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    ep.on("exitedFromRoom", "ScreenShareSelector.exitedFromRoom", () => {
      setScreenSharing(false);
    });
  }, [])

  const handleClick = (event) => {
    let user = ep.getUser();
    if (user && user.currentRoom !== "0") {
      if (screenSharing) {
        ep.stopScreenSharing();
        setScreenSharing(false);
      } else {
        ep.getVideoDevices().then((devices) => {
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

        handleModalOpen();
      }
    } else {
      console.warn("You must be in a room to share your screen")
    }

  };
  const deviceSelected = (deviceId) => {
    console.log("device selected", deviceId)
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
          </Box>
        </Zoom>
      </Modal>
    </div>
  )
}

export default ScreenShareSelector