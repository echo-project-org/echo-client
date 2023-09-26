import { useState, useEffect } from 'react'
import { Stack, Slider, Typography, Grid, ClickAwayListener } from '@mui/material';
import { VolumeUp, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';

import { ep, storage } from "../../index";

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

  const deviceListToggle = (status = true) => {
    setShowList(status);
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
    outputDevices.forEach(device => {
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
            outputDevices.map((device, id) => (
              <Grid item className="deviceSelectorContainer-item" lg={12} xs={12} onMouseDown={handleOutputDeviceChange} data-value={device.id} key={id}>
                {device.id === outputDevice ? <CheckCircle fontSize="small" /> : <></>}
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
        Output device
      </Typography>
      <div className="deviceSelector-root" onMouseDown={deviceListToggle}>
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
    </div>
  )
}

export default OutputDevicesSettings