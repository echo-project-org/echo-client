import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';

import UserSettings from "./UserSettings";
import InputDevicesSettings from './InputDevicesSettings';
import OutputDevicesSettings from './OutputDevicesSettings';

import { ep } from "../../index";

const modalStyle = {
  position: "relative",
  top: "5%",
  margin: "auto",
  height: '80%',
  width: '80%',
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

function SettingsButton() {
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleClick = (event) => {
    ep.getSpeakerDevices().then((devices) => {
      setOutputDevices(devices)
    })

    ep.getMicrophoneDevices().then((devices) => {
      setInputDevices(devices)
    })

    handleModalOpen();
  };

  return (
    <div>
      <Tooltip title="Settings" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
        <Button onClick={handleClick}>
          <SettingsIcon />
        </Button>
      </Tooltip>

      <ThemeProvider theme={modalTheme}>
        <Modal
          open={modalOpen}
          onClose={handleModalClose}
        >
          <Zoom in={modalOpen}>
            <Box sx={modalStyle}>
              <div className='modalDiv'>
                <Typography id="modal-modal-title" variant="h3">
                  Echo settings
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs>
                    <InputDevicesSettings inputDevices={inputDevices} />
                  </Grid>
                  <Grid item xs>
                    <OutputDevicesSettings outputDevices={outputDevices} />
                  </Grid>
                  <Grid item xs={12}>
                    <UserSettings />
                  </Grid>
                </Grid>
              </div>
            </Box>
          </Zoom>
        </Modal>
      </ThemeProvider>
    </div>
  )
}

export default SettingsButton