import React from 'react'
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';

const at = require('../../audioTransmitter')

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
    },
});

function InputDevicesSettings({ inputDevices }) {
    const [inputDevice, setInputDevice] = useState('default');
    const [micVolume, setMicVolulme] = useState(100);

    const handleInputDeviceChange = (event) => {
        setInputDevice(event.target.value);
        at.setAudioDevice(event.target.value)
    };

    const handleMicVolumeChange = (event, newValue) => {
        //set user volume
        setMicVolulme(newValue);
        at.setMicVolume(newValue / 100)
    };

    const renderDeviceList = () => {
        let a = inputDevices.map(device => (
            <MenuItem key={device.id} value={device.id} >
                {device.name}
            </MenuItem>
        ))

        setSelected();
        return a;
    }

    const setSelected = () => {
        let audioDeviceId = localStorage.getItem('inputAudioDeviceId');
        if (audioDeviceId && audioDeviceId !== inputDevice) {
            setInputDevice(audioDeviceId);
        }

        let micVol = localStorage.getItem('micVolume') * 100;
        micVol = Math.round(micVol);
        if(micVol && micVol !== micVolume){
            setMicVolulme(micVol);
        }
    }

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
                sx={{
                    border: "1px solid #f5e8da",
                    color: "#f5e8da"
                }}
            >
                {renderDeviceList()}
            </Select>
            <div style={{ width: "100%" }}>
                <Stack spacing={2} direction="row" alignItems="center">
                    <MicIcon fontSize="medium" />
                    <ThemeProvider theme={theme} >
                    <Slider
                        sx={{ width: "10rem" }}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => { return v + "%" }}
                        aria-label="Volume"
                        value={micVolume}
                        onChange={handleMicVolumeChange}
                        size='medium'
                    />
                    </ThemeProvider>
                </Stack>
            </div>
        </div>
    )
}

export default InputDevicesSettings