import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { StopScreenShare, ScreenShare } from '@mui/icons-material';

import { ep } from "../../index";
import ScreenShareOption from './ScreenShareOption';

const modalStyle = {
  position: "relative",
  top: "15%",
  margin: "auto",
  height: '50%',
  width: '50%',
  bgcolor: '#4d3352',
  color: '#f5e8da',
  overflow: 'auto',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '.4rem',
};

const modalTheme = createTheme({
  palette: {
    primary: { main: '#f5e8da', },
    secondary: { main: '#ce8ca5', },
  },
  typography: {
    fontFamily: ['Roboto Condensed'].join(','),
  },
  MuiSlider: {
    styleOverrides: {
      thumb: {
        cursor: "e-resize",
        width: "15px",
        height: "15px",
        color: "white",
        ":hover": {
          color: "white",
          boxShadow: "0 0 5px 10px rgba(255, 255, 255, 0.1)"
        }
      },
      valueLabel: {
        backgroundColor: "#3e2542",
        color: "white",
        borderRadius: "10px",
      },
      valueLabelOpen: {
        backgroundColor: "#3e2542",
        color: "white",
        borderRadius: "10px",
      },
      colorPrimary: {
        color: "white",
        // backgroundColor: "white"
      },
      colorSecondary: {
        color: "white",
        // backgroundColor: "white"
      },
      markLabel: {
        color: "white"
      }
    }
  },
});

function ScreenShareSelector() {
  let [screenSharing, setScreenSharing] = useState(false);
  let [windowsDevices, setWindowsDevices] = useState([]);
  let [screenDevices, setScreenDevices] = useState([]);
  let [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleClick = (event) => {
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

      <ThemeProvider theme={modalTheme}>
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
      </ThemeProvider>
    </div>
  )
}

export default ScreenShareSelector