import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Stack, Slider, Typography, Grid } from '@mui/material';
import { VolumeUp, ArrowDropDown, ArrowDropUp } from '@mui/icons-material';

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

function OutputDevicesSettings({ outputDevices }) {
  const [outputDevice, setOutputDevice] = useState('default');
  const [soundVolume, setSoundVolulme] = useState(100);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setOutputDevice(storage.get('outputAudioDeviceId') || "default");
    ep.setSpeakerDevice(storage.get('outputAudioDeviceId') || 1);
    setSoundVolulme(Math.floor(storage.get('audioVolume') * 100) || 100);
  }, []);

  const handleOutputDeviceChange = (event) => {
    storage.set('outputAudioDeviceId', event.target.dataset.value);
    setOutputDevice(event.target.dataset.value);
    ep.setSpeakerDevice(event.target.dataset.value)
  };

  const handleSoundVolumeChange = (event, newValue) => {
    //set user volume
    storage.set('audioVolume', newValue / 100);
    setSoundVolulme(newValue);
    ep.setSpeakerVolume(newValue / 100);
  };

  const deviceListToggle = () => {
    setShowList(!showList);
  }
  const computeCurrentDevice = () => {
    var currentDevice = outputDevices.find(device => device.id === outputDevice);
    if (!currentDevice) currentDevice = { name: "Default" };
    return (
      <Typography className="deviceSelectorText" sx={{ width: "100%" }}>
        {showList ? <ArrowDropUp /> : <ArrowDropDown />}
        {currentDevice.name}
      </Typography>
    )
  }
  const computeSelectList = () => {
    if (showList) {
      return (
        <Grid container className="deviceSelectorContainer-items" direction={"column"} spacing={2} sx={{ textAlign: "center" }}>
          {
            outputDevices.map((device, id) => (
              <Grid item className="deviceSelectorContainer-item" lg={12} xs={12} onMouseDown={handleOutputDeviceChange} data-value={device.id} key={id}>
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
      <ThemeProvider theme={theme}>
        <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
          Output device
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