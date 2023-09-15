import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MenuItem, Stack, Slider, Typography, Select, Divider } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';

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
        selected: {
          backgroundColor: "#2f1c32",
          color: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:focus": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:active": {
            backgroundColor: "#2f1c32",
            color: "white"
          }
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
        selected: {
          backgroundColor: "#2f1c32",
          color: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:focus": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:active": {
            backgroundColor: "#2f1c32",
            color: "white"
          }
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
        selected: {
          backgroundColor: "#000000",
          color: "white",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:focus": {
            backgroundColor: "#2f1c32",
            color: "white"
          },
          "&:active": {
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

function OutputDevicesSettings({ outputDevices }) {
  const [outputDevice, setOutputDevice] = useState('default');
  const [soundVolume, setSoundVolulme] = useState(100);

  const handleOutputDeviceChange = (event) => {
    localStorage.setItem('outputAudioDeviceId', event.target.value);
    setOutputDevice(event.target.value);
    ep.setSpeakerDevice(event.target.value)
  };

  const handleSoundVolumeChange = (event, newValue) => {
    //set user volume
    localStorage.setItem('audioVolume', newValue / 100);
    setSoundVolulme(newValue);
    ep.setSpeakerVolume(newValue / 100);
  };

  useEffect(() => {
    ep.setSpeakerDevice(localStorage.getItem('outputAudioDeviceId') || 1);
    setSoundVolulme(Math.floor(localStorage.getItem('audioVolume') * 100) || 100);
  }, []);

  const renderDeviceList = () => {
    let a = outputDevices.map((device, id) => (
      <MenuItem key={id} value={device.id}>
        {device.name}
      </MenuItem>
    ))

    setSelected();
    return a;
  }

  const setSelected = () => {
    let audioDeviceId = localStorage.getItem('outputAudioDeviceId');
    if (audioDeviceId && audioDeviceId !== outputDevice) {
      setOutputDevice(audioDeviceId);
    }

    let audioVol = localStorage.getItem('mainOutVolume') * 100;
    audioVol = Math.round(audioVol);
    if (audioVol && audioVol !== soundVolume) {
      setSoundVolulme(audioVol);
    }
  }

  return (
    <div className="settingsModalSubDiv">
      <ThemeProvider theme={theme}>
        <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
          Output device
        </Typography>
        <Select
          value={outputDevice}
          onChange={handleOutputDeviceChange}
          autoWidth
          size='small'
        >
          {renderDeviceList()}
        </Select>
        <div style={{ paddingRight: "2%", width: "95%" }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <VolumeUp fontSize="medium" />
            <Slider
              sx={{ width: "95%" }}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => { return v + "%" }}
              aria-label="Volume"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              size='medium'
            />
          </Stack>
        </div>
      </ThemeProvider>
    </div>
  )
}

export default OutputDevicesSettings