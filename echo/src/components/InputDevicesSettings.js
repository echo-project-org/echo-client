import React from 'react'
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';


function InputDevicesSettings({inputDevices}) {
    const [inputDevice, setInputDevice] = React.useState({});
    const [micVolume, setMicVolulme] = React.useState(100);

    const handleInputDeviceChange = (event) => {
        setInputDevice(event.target.value);
    };

    const handleMicVolumeChange = (event, newValue) => {
        //set user volume
        setMicVolulme(newValue);
    };
    
    return (
        <div className="settingsModalSubDiv">
            <Typography id="modal-modal-title" variant="h6" component="h2">
                Input device
            </Typography>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={inputDevice}
                onChange={handleInputDeviceChange}
                autoWidth
            >
                {
                    inputDevices.map(device => (
                        <MenuItem key={device.id} value={device.id} >
                            {device.name}
                        </MenuItem>
                    ))
                }
            </Select>
            <div style={{ width: "100%" }}>
                <Stack spacing={2} direction="row" alignItems="center">
                    <MicIcon fontSize="medium" />
                    <Slider
                        sx={{ width: "10rem" }}
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