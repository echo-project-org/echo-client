import { useState, useEffect } from 'react'
import { Stack, Slider, Typography, Grid, ClickAwayListener, Tooltip, FormControlLabel, Switch } from '@mui/material';
import { Mic, ArrowDropDown, ArrowDropUp, CheckCircle, RecordVoiceOver } from '@mui/icons-material';

import { ep, storage } from "../../index";

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
  const [echoCancellation, setEchoCancellation] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [micTest, setMicTest] = useState(false);
  const [vadTreshold, setVadTreshold] = useState(0);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setInputDevice(storage.get('inputAudioDeviceId') || "default");

    ep.setMicrophoneVolume(storage.get('micVolume') || 1);
    ep.setMicrophoneDevice(storage.get('inputAudioDeviceId') || "default");
    ep.setVadTreshold(storage.get('vadTreshold') || 1);
    ep.setMicrophoneTest(false);
    ep.setEchoCancellation(storage.get('echoCancellation') === 'true' || false);
    ep.setNoiseSuppression(storage.get('noiseSuppression') === 'true' || false);
    ep.setAutoGainControl(storage.get('autoGainControl') === 'true' || false);
    console.log(storage.get('echoCancellation') === 'true');
    setMicVolulme(Math.floor(storage.get('micVolume') * 100) || 100);
    setVadTreshold(Math.floor(storage.get('vadTreshold') * 100) || 0);
    setMicTest(false);
    setEchoCancellation(storage.get('echoCancellation') === 'true' || false);
    setNoiseSuppression(storage.get('noiseSuppression') === 'true' || false);
    setAutoGainControl(storage.get('autoGainControl') === 'true' || false);
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

  const handleVadTresholdChange = (event, newValue) => {
    //set user volume
    storage.set('vadTreshold', newValue / 100);
    setVadTreshold(newValue);
    ep.setVadTreshold(newValue / 100);
  };

  const handleTestChange = (event) => {
    setMicTest(event.target.checked);
    ep.setMicrophoneTest(event.target.checked);
  }

  const handleEchoCancellationChange = (event) => {
    console.log(event.target.checked)
    setEchoCancellation(event.target.checked);
    ep.setEchoCancellation(event.target.checked);
    storage.set('echoCancellation', event.target.checked);
  }

  const handleNoiseSuppressionChange = (event) => {
    setNoiseSuppression(event.target.checked);
    ep.setNoiseSuppression(event.target.checked);
    storage.set('noiseSuppression', event.target.checked);
  }

  const handleAutoGainControlChange = (event) => {
    setAutoGainControl(event.target.checked);
    ep.setAutoGainControl(event.target.checked);
    storage.set('autoGainControl', event.target.checked);
  }

  const deviceListToggle = (status = true) => {
    setShowList(status);
  }

  return (
    <div className="settingsModalSubDiv noselect">
      <Typography variant="h6" component="h2" sx={{ width: "95%" }}>
        Input device
      </Typography>
      <div className="deviceSelector-root" onMouseUp={deviceListToggle}>
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
      <div style={{ paddingRight: "2%", width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip title="Voice activity detection" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <RecordVoiceOver fontSize="medium" />
          </Tooltip>
          <Slider
            sx={{ width: "95%" }}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => { return v + "%" }}
            aria-label="Volume"
            value={vadTreshold}
            onChange={handleVadTresholdChange}
            size='medium'
          />
        </Stack>
      </div>
      <div style={{ paddingRight: "2%", width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <FormControlLabel control={<Switch checked={micTest} onChange={handleTestChange} />} label="Test your input device" />
          <FormControlLabel control={<Switch checked={echoCancellation} onChange={handleEchoCancellationChange} />} label="Echo cancellation" />
          <FormControlLabel control={<Switch checked={noiseSuppression} onChange={handleNoiseSuppressionChange} />} label="Noise suppression" />
          <FormControlLabel control={<Switch checked={autoGainControl} onChange={handleAutoGainControlChange} />} label="Auto gain control" />
        </Stack>
      </div>
    </div>
  )
}

export default InputDevicesSettings