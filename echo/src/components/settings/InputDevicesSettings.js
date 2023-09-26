import { useState, useEffect } from 'react'
import { Stack, Slider, Typography, Grid, ClickAwayListener } from '@mui/material';
import { Mic, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';

import { ep, storage } from "../../index";

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

  const deviceListToggle = (status = true) => {
    setShowList(status);
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
        <Grid container className="deviceSelectorContainer-items" direction={"column"} spacing={2} sx={{ textAlign: "center" }}>
          {
            inputDevices.map((device, id) => (
              <Grid item className="deviceSelectorContainer-item" lg={12} xs={12} onMouseUp={handleInputDeviceChange} data-value={device.id} key={id}>
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
      <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
        Input device
      </Typography>
      <div className="deviceSelector-root" onMouseUp={deviceListToggle}>
        <ClickAwayListener onClickAway={() => deviceListToggle(false)}>
          <div className="deviceSelectorContainer">
            {computeCurrentDevice()}
          </div>
        </ClickAwayListener>
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
    </div>
  )
}

export default InputDevicesSettings