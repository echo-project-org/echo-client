
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useState, useEffect } from 'react'
import Slider from '@mui/material/Slider';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import React from 'react'

const ar = require('../audioReceiver')

function OutputDevicesSettings({ outputDevices }) {
    const [outputDevice, setOutputDevice] = useState('');
    const [soundVolume, setSoundVolulme] = useState(100);

    const handleOutputDeviceChange = (event) => {
        setOutputDevice(event.target.value);
        ar.setAudioDevice(event.target.value)
    };

    const handleSoundVolumeChange = (event, newValue) => {
        //set user volume
        setSoundVolulme(newValue);
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
            >
                {renderDeviceList()}
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