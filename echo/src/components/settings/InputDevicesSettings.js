import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MenuItem, Stack, Slider, Typography, Select } from '@mui/material';
import { Mic } from '@mui/icons-material';

import { ep, storage } from "../../index";

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
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "none",
          backgroundColor: "#3a223e",
          color: "white",
          borderRadius: '0px 0px 5px 5px',
          boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)",
          border: "1px solid #4b2b50",
          margin: "0",
        },
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          transition: "none",
          padding: "0",
          width: "100%",
          color: "white",
          borderRadius: '0px 0px 5px 5px',
          boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)",
          border: "1px solid #4b2b50",
          margin: "0"
        },
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "white",
          borderBottom: "1px solid #4b2b50",
          padding: "0.5rem 1rem",
          "&:hover": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:focus": {
            backgroundColor: "#2f1c32",
            color: "white"
          }
        },
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          width: "95%",
          border: "1px solid #f5e8da",
          color: "#f5e8da",
          "&:focus": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:hover": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:active": {
            backgroundColor: "#2f1c32",
            color: "white"
          }
        },
        icon: {
          color: "white"
        }
      }
    },
  }
});

function InputDevicesSettings({ inputDevices }) {
  const [inputDevice, setInputDevice] = useState('default');
  const [micVolume, setMicVolulme] = useState(100);

  const handleInputDeviceChange = (event) => {
    storage.set('inputAudioDeviceId', event.target.value);
    setInputDevice(event.target.value);
    ep.setMicrophoneDevice(event.target.value);
  };

  const handleMicVolumeChange = (event, newValue) => {
    //set user volume
    storage.set('micVolume', newValue / 100);
    setMicVolulme(newValue);
    ep.setMicrophoneVolume(newValue / 100);
  };

  useEffect(() => {
    ep.setMicrophoneVolume(storage.get('micVolume') || 1);
    setMicVolulme(Math.floor(storage.get('micVolume') * 100) || 100);
  });

  const renderDeviceList = () => {
    let a = inputDevices.map((device, id) => (
      <MenuItem key={id} value={device.id}>
        {device.name}
      </MenuItem>
    ))

    setSelected();
    return a;
  }

  const setSelected = () => {
    let audioDeviceId = storage.get('inputAudioDeviceId');
    if (audioDeviceId && audioDeviceId !== inputDevice) {
      setInputDevice(audioDeviceId);
    }
  }

  return (
    <div className="settingsModalSubDiv">
      <ThemeProvider theme={theme} >
        <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
          Input device
        </Typography>
        <Select
          value={inputDevice}
          onChange={handleInputDeviceChange}
          autoWidth
          size='small'
        >
          {renderDeviceList()}
        </Select>
        <div style={{ paddingRight: "2%", width: "95%" }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <Mic fontSize="medium" />
            <Slider
              sx={{ width: "95%" }}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => { return v + "%" }}
              aria-label="Volume"
              value={micVolume}
              onChange={handleMicVolumeChange}
              size='medium'
            />
          </Stack>
        </div>
      </ThemeProvider>
    </div>
  )
}

export default InputDevicesSettings