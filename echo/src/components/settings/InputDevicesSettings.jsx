import { useState, useEffect } from 'react'
import { Stack, Slider, Typography, Grid, ClickAwayListener, Tooltip, FormControlLabel, Switch } from '@mui/material';
import { Mic, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';
import { info } from '@lib/logger';
import { ee, ep, storage } from "@root/index";
import StyledComponents from '@root/StylingComponents';

const CurrentDevice = ({ inputDevices, inputDevice, showList }) => {
  var currentDevice = inputDevices.find(device => device.id === inputDevice);
  if (!currentDevice) currentDevice = { name: "Default" };
  return (
    <Typography className="deviceSelectorText" sx={{ width: "100%" }}>
      {showList ? <ArrowDropUp /> : <ArrowDropDown />}
      {currentDevice.name}
    </Typography>
  )
}

const DevicesSelectList = ({ inputDevices, handleInputDeviceChange, inputDevice, showList }) => {
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

function InputDevicesSettings({ inputDevices }) {
  const [inputDevice, setInputDevice] = useState('default');
  const [micVolume, setMicVolulme] = useState(100);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setInputDevice(storage.get('inputAudioDeviceId') || "default");
    setMicVolulme(Math.floor(storage.get('micVolume') * 100) || 100);

    ep.setMicrophoneVolume(storage.get('micVolume') || 1);
    ep.setMicrophoneDevice(storage.get('inputAudioDeviceId') || "default");
  }, []);

  const handleInputDeviceChange = (event) => {
    let device = event.target.dataset.value;
    info("[InputDevicesSettings] Input device changed to " + device);
    storage.set('inputAudioDeviceId', device);
    setInputDevice(device);
    ep.setMicrophoneDevice(device);
  };

  const handleMicVolumeChange = (event, newValue) => {
    info("[InputDevicesSettings] Mic volume changed to " + newValue);
    storage.set('micVolume', newValue / 100);
    setMicVolulme(newValue);
    ep.setMicrophoneVolume(newValue / 100);
  };

  const deviceListToggle = (status = true) => {
    info("[InputDevicesSettings] Device list toggled " + status);
    setShowList(status);
  }

  return (
    <StyledComponents.Settings.StyledSettingsModalSubdiv>
      <Typography variant="h6" component="h2" sx={{ width: "95%" }} className="noselect">
        Input device
      </Typography>
      <div className="deviceSelector-root noselect" onMouseUp={deviceListToggle}>
        <ClickAwayListener onClickAway={() => deviceListToggle(false)}>
          <div className="deviceSelectorContainer">
            <CurrentDevice inputDevices={inputDevices} inputDevice={inputDevice} showList={showList} />
          </div>
        </ClickAwayListener>
        <div className="deviceSelectorListContainer">
          <DevicesSelectList inputDevices={inputDevices} handleInputDeviceChange={handleInputDeviceChange} inputDevice={inputDevice} showList={showList} />
        </div>
      </div>

      <div style={{ paddingRight: "2%", width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip title="Mic volume" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Mic fontSize="medium" />
          </Tooltip>
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
    </StyledComponents.Settings.StyledSettingsModalSubdiv>
  )
}

export default InputDevicesSettings