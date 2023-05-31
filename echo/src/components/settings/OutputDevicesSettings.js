
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import React from 'react'

const ar = require('../../audioReceiver')

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

function OutputDevicesSettings({ outputDevices }) {
    const [outputDevice, setOutputDevice] = useState('default');
    const [soundVolume, setSoundVolulme] = useState(100);

    const handleOutputDeviceChange = (event) => {
        setOutputDevice(event.target.value);
        ar.setAudioDevice(event.target.value)
    };

    const handleSoundVolumeChange = (event, newValue) => {
        //set user volume
        setSoundVolulme(newValue);
        ar.setAudioVolume(newValue / 100);
    };

    const renderDeviceList = () => {
        let a = outputDevices.map(device => (
            <MenuItem key={device.id} value={device.id} >
                {device.name}
            </MenuItem>
        ))

        setSelected();
        return a;
    }

    const setSelected = () => {
        let audioDeviceId = localStorage.getItem('outputAudioDeviceId');
        if (audioDeviceId && audioDeviceId !== outputDevice) {
            setOutputDevice(audioDeviceId);
        }

        let audioVol = localStorage.getItem('mainOutVolume') * 100;
        audioVol = Math.round(audioVol);
        if(audioVol && audioVol !== soundVolume){
            setSoundVolulme(audioVol);
        }
    }

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
                sx = {{
                    border: "1px solid #f5e8da",
                    color: "#f5e8da"
                }}
            >
                {renderDeviceList()}
            </Select>
            <div style={{ width: "100%" }}>
                <Stack spacing={2} direction="row" alignItems="center">
                    <VolumeUpIcon fontSize="medium" />
                    <ThemeProvider theme={theme}>
                        <Slider
                            sx={{ width: "10rem" }}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(v) => { return v + "%" }}
                            aria-label="Volume"
                            value={soundVolume}
                            onChange={handleSoundVolumeChange}
                            size='medium'
                        />
                    </ThemeProvider>
                </Stack>
            </div>
        </div>
    )
}

export default OutputDevicesSettings