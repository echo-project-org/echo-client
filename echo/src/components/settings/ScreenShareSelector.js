import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

import { ep } from "../../index";
import ScreenShareOption from './ScreenShareOption';

const modalStyle = {
    position: "relative",
    top: "5%",
    margin: "auto",
    height: '80%',
    width: '80%',
    bgcolor: '#4d3352',
    color: '#f5e8da',
    overflow: 'auto',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '.4rem',
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

function ScreenShareSelector() {
    let [screenSharing, setScreenSharing] = useState(false);
    let [videoDevices, setVideoDevices] = useState([]);
    let [modalOpen, setModalOpen] = useState(false);
    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const handleClick = (event) => {
        ep.getVideoDevices().then((devices) => {
            setVideoDevices(devices)
        })

        handleModalOpen();
    };

    return (
        <div>
            <Tooltip title="Share Your Screen" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
                <Button onClick={handleClick}>
                    {!screenSharing ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </Button>
            </Tooltip>

            <ThemeProvider theme={modalTheme}>
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}
                >
                    <Zoom in={modalOpen}>
                        <Box sx={modalStyle}>
                            <div className='modalDiv'>
                                <Typography id="modal-modal-title" variant="h3">
                                    Share your screen
                                </Typography>

                                <Grid container spacing={2}>
                                    {
                                        videoDevices.map((device) => (
                                            <Grid item xs>
                                                <ScreenShareOption key={device.id} device={device} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </div>
                        </Box>
                    </Zoom>
                </Modal>
            </ThemeProvider>
        </div>
    )
}

export default ScreenShareSelector