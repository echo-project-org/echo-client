import React from 'react'
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';

import { ep } from "../../index";

const theme = createTheme({
  components: {
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
  },
});

function InputDevicesSettings({ inputDevices }) {
  const [inputDevice, setInputDevice] = useState('default');
  const [micVolume, setMicVolulme] = useState(100);

  const handleInputDeviceChange = (event) => {
    localStorage.setItem('inputAudioDeviceId', event.target.value);
    setInputDevice(event.target.value);
    ep.setMicrophoneDevice(event.target.value);
  };

  const handleMicVolumeChange = (event, newValue) => {
    //set user volume
    localStorage.setItem('micVolume', newValue / 100);
    setMicVolulme(newValue);
    ep.setMicrophoneVolume(newValue / 100);
  };

  useEffect(() => {
    ep.setMicrophoneVolume(localStorage.getItem('micVolume') || 1);

    setMicVolulme(Math.floor(localStorage.getItem('micVolume') * 100) || 100);
  }, []);

  const renderDeviceList = () => {
    let a = inputDevices.map(device => (
      <MenuItem key={device.id} value={device.id} >
        {device.name}
      </MenuItem>
    ))

    setSelected();
    return a;
  }

  const setSelected = () => {
    let audioDeviceId = localStorage.getItem('inputAudioDeviceId');
    if (audioDeviceId && audioDeviceId !== inputDevice) {
      setInputDevice(audioDeviceId);
    }
  }

  return (
    <div className="settingsModalSubDiv">
      <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
        Input device
      </Typography>
      <Select
        value={inputDevice}
        onChange={handleInputDeviceChange}
        autoWidth
        size='small'
        sx={{
          width: "95%",
          border: "1px solid #f5e8da",
          color: "#f5e8da"
        }}
      >
        {renderDeviceList()}
      </Select>
      <div style={{ paddingRight: "2%", width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <MicIcon fontSize="medium" />
          <ThemeProvider theme={theme} >
            <Slider
              sx={{ width: "95%" }}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => { return v + "%" }}
              aria-label="Volume"
              value={micVolume}
              onChange={handleMicVolumeChange}
              size='medium'
            />
          </ThemeProvider>
        </Stack>
      </div>
    </div>
  )
}

export default InputDevicesSettings