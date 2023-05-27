import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from "@mui/material/Tooltip";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import React from 'react'

function OutputDevicesSettings({ outputDevices }) {
    const [outputDevice, setOutputDevice] = React.useState({});
    const [soundVolume, setSoundVolulme] = React.useState(100);

    const handleOutputDeviceChange = (event) => {
        setOutputDevice(event.target.value);
    };

    const handleSoundVolumeChange = (event, newValue) => {
        //set user volume
        setSoundVolulme(newValue);
    };

    return (
        <div className="settingsModalSubDiv">
            <Typography id="modal-modal-title" variant="h6" component="h2">
                Output device
            </Typography>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={outputDevice}
                onChange={handleOutputDeviceChange}
                autoWidth
            >
                {
                    outputDevices.map(device => (
                        <MenuItem key={device.id} value={device.id} >
                            {device.name}
                        </MenuItem>
                    ))
                }
            </Select>
            <div style={{ width: "100%" }}>
                <Stack spacing={2} direction="row" alignItems="center">
                    <VolumeUpIcon fontSize="medium" />
                    <Slider
                        sx={{ width: "10rem" }}
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