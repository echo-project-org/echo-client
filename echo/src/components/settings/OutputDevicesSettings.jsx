import { useState, useEffect } from 'react'
import { Stack, Slider, Typography, Grid, ClickAwayListener, Tooltip } from '@mui/material';
import { VolumeUp, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';
import { info } from '@lib/logger';
import { ee, ep, storage } from "@root/index";
import StyledComponents from '@root/StylingComponents';

const CurrentDevice = ({ outputDevices, outputDevice, showList }) => {
  var currentDevice = outputDevices.find(device => device.id === outputDevice);
  if (!currentDevice) currentDevice = { name: "Default" };
  return (
    <Typography className="deviceSelectorText" sx={{ width: "100%" }}>
      {showList ? <ArrowDropUp /> : <ArrowDropDown />}
      {currentDevice.name}
    </Typography>
  )
}

const DevicesSelectList = ({ outputDevices, handleOutputDeviceChange, outputDevice, showList }) => {
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
      <Grid container className="deviceSelectorContainer-items" direction={"column"} spacing={2} sx={{ textAlign: "center" }}>
        {
          outputDevices.map((device, id) => (
            <Grid item className="deviceSelectorContainer-item" lg={12} xs={12} onMouseUp={handleOutputDeviceChange} data-value={device.id} key={id}>
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

function OutputDevicesSettings({ outputDevices }) {
  const [outputDevice, setOutputDevice] = useState('default');
  const [soundVolume, setSoundVolulme] = useState(100);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    setOutputDevice(storage.get('outputAudioDeviceId') || "default");
    setSoundVolulme(Math.floor(storage.get('audioVolume') * 100) || 100);
    ep.setSpeakerDevice(storage.get('outputAudioDeviceId') || "default");
    ep.setSpeakerVolume(storage.get('audioVolume') || 1);
  }, []);

  const handleOutputDeviceChange = (event) => {
    let device = event.target.dataset.value;
    info("[OutputDevicesSettings] Output device changed to " + device);
    storage.set('outputAudioDeviceId', device);
    setOutputDevice(device);
    ep.setSpeakerDevice(device)
  };

  const handleSoundVolumeChange = (event, newValue) => {
    info("[OutputDevicesSettings] Sound volume changed to " + newValue);
    //set user volume
    storage.set('audioVolume', newValue / 100);
    setSoundVolulme(newValue);
    ep.setSpeakerVolume(newValue / 100);
  };

  const deviceListToggle = (status = true) => {
    info("[OutputDevicesSettings] Device list toggled to " + status);
    setShowList(status);
  }

  return (
    <StyledComponents.Settings.StyledSettingsModalSubdiv>
      <Typography variant="h6" component="h2" sx={{ width: "95%" }} className="noselect">
        Output device
      </Typography>
      <div className="deviceSelector-root noselect" onMouseDown={deviceListToggle}>
        <ClickAwayListener onClickAway={() => deviceListToggle(false)}>
          <div className="deviceSelectorContainer">
            <CurrentDevice outputDevices={outputDevices} outputDevice={outputDevice} showList={showList} />
          </div>
        </ClickAwayListener>
        <div className="deviceSelectorListContainer">
          <DevicesSelectList outputDevices={outputDevices} handleOutputDeviceChange={handleOutputDeviceChange} outputDevice={outputDevice} showList={showList} />
        </div>
      </div>
      <div style={{ paddingRight: "2%", width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip title="Speaker volume" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <VolumeUp fontSize="medium" />
          </Tooltip>
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
    </StyledComponents.Settings.StyledSettingsModalSubdiv>
  )
}

export default OutputDevicesSettings