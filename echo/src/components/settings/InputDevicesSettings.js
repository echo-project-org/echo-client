import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Stack, Slider, Typography, Grid } from '@mui/material';
import { Mic, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';

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
  }
});

function InputDevicesSettings({ inputDevices }) {
  const [inputDevice, setInputDevice] = useState('default');
  const [micVolume, setMicVolulme] = useState(100);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setInputDevice(storage.get('inputAudioDeviceId') || "default");
    ep.setMicrophoneVolume(storage.get('micVolume') || 1);
    setMicVolulme(Math.floor(storage.get('micVolume') * 100) || 100);
  }, []);

  const handleInputDeviceChange = (event) => {
    storage.set('inputAudioDeviceId', event.target.dataset.value);
    setInputDevice(event.target.dataset.value);
    ep.setMicrophoneDevice(event.target.dataset.value);
  };

  const handleMicVolumeChange = (event, newValue) => {
    //set user volume
    storage.set('micVolume', newValue / 100);
    setMicVolulme(newValue);
    ep.setMicrophoneVolume(newValue / 100);
  };

  const deviceListToggle = () => {
    setShowList(!showList);
  }
  const computeCurrentDevice = () => {
    var currentDevice = inputDevices.find(device => device.id === inputDevice);
    if (!currentDevice) currentDevice = { name: "Default" };
    return (
      <Typography className="deviceSelectorText" sx={{ width: "100%" }}>
        {showList ? <ArrowDropUp /> : <ArrowDropDown />}
        {currentDevice.name}
      </Typography>
    )
  }
  const computeSelectList = () => {
    inputDevices.forEach(device => {
      const startIndex = device.name.indexOf('(', device.name.indexOf('(') + 1);
      const endIndex = device.name.indexOf(')', startIndex);
      if (startIndex !== -1 && endIndex !== -1) {
        // Remove the second set of parentheses and trim the result
        device.name = device.name.slice(0, startIndex) + device.name.slice(endIndex + 1).trim();
      }
    })

    if (showList) {
      return (
        <Grid container className="deviceSelectorContainer-items" direction={"column"} spacing={2} sx={{ textAlign: "center" }} onMouseLeave={deviceListToggle}>
          {
            inputDevices.map((device, id) => (
              <Grid item className="deviceSelectorContainer-item" lg={12} xs={12} onMouseDown={handleInputDeviceChange} data-value={device.id} key={id}>
                {device.id === inputDevice ? <CheckCircle fontSize="small" /> : <></>}
                {device.name}
              </Grid>
            ))
          }
        </Grid>
      )
    }
    return <></>
  }

  return (
    <div className="settingsModalSubDiv noselect">
      <ThemeProvider theme={theme} >
        <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
          Input device
        </Typography>
        <div className="deviceSelector-root" onMouseDown={deviceListToggle}>
          <div className="deviceSelectorContainer">
            {computeCurrentDevice()}
          </div>
          <div className="deviceSelectorListContainer">
            {computeSelectList()}
          </div>
        </div>
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