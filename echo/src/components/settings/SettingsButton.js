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
import { useState, useEffect } from 'react';
import Zoom from '@mui/material/Zoom';
import InputDevicesSettings from './InputDevicesSettings';
import OutputDevicesSettings from './OutputDevicesSettings';

const ar = require('../../audioReceiver')
const at = require('../../audioTransmitter')

const modalStyle = {
    position: 'absolute',
    top: '5%',
    left: '15%',
    // transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: '#4d3352',
    color: '#f5e8da',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '.5rem',
};

const modalTheme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
    typography: {
        fontFamily: ['Roboto Condensed'].join(','),
    },
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
});

function SettingsButton() {
    const [inputDevices, setInputDevices] = useState([]);
    const [outputDevices, setOutputDevices] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const handleClick = (event) => {
        ar.getAudioDevices().then((devices) => {
            setOutputDevices(devices)
        })

        at.getAudioDevices().then((devices) => {
            setInputDevices(devices)
        })

        handleModalOpen();
    }; 

    return (
        <div>
            <Tooltip title="Settings" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
                <Button onClick={handleClick}>
                    <SettingsIcon />
                </Button>
            </Tooltip>

            <ThemeProvider theme={modalTheme}>
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Zoom in={modalOpen}>
                        <Box sx={modalStyle}>
                            <div className='modalDiv'>
                                <Typography id="modal-modal-title" variant="h3">
                                    Echo settings
                                </Typography>

                                <InputDevicesSettings inputDevices={inputDevices} />
                                <OutputDevicesSettings outputDevices={outputDevices} />
                            </div>
                        </Box>
                    </Zoom>
                </Modal>
            </ThemeProvider>
        </div>
    )
}

export default SettingsButton