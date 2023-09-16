import React from 'react';
import { useState, useEffect } from 'react';
import { Grid, Typography, IconButton } from '@mui/material';
import { ButtonGroup, Button, Zoom, Tooltip } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { CancelPresentation, Mic, MicOffRounded, VolumeUp, VolumeOff } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    color: "white",
                    fontSize: ".9rem",
                    border: "1px solid rgb(235, 144, 235)",
                    background: "#3e2542",
                    borderRadius: 10,
                    padding: 8
                },
                arrow: {
                    fontSize: 16,
                    width: 17,
                    "&::before": {
                        border: "1px solid rgb(235, 144, 235)",
                        backgroundColor: "#3e2542",
                        boxSizing: "border-box"
                    }
                }
            }
        }
    }
});

const ScreenShareControlIcons = ({ muted, toggleMuteStream }) => {
    const [showControls, setShowControls] = useState(false);

    const handleMouseEnter = () => {
        setShowControls(true);
    }

    const handleMouseLeave = () => {
        setShowControls(false);
    }

    const stopWaching = () => {
        console.log("Stop watching")
    }

    const controlsDivStyle = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s ease',
    }

    return (
        <div style={controlsDivStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Grid container direction='row' alignContent='center' justifyContent='start' style={{ padding: 16 }}>
                <Grid item>
                    <Typography variant='h5' style={{ color: '#f5e8da' }}>Player</Typography>
                </Grid>

            </Grid>
            <Grid container direction='row' alignItems='center' justifyContent='center' paddingBottom={"1rem"}>
                <ThemeProvider theme={theme}>
                    <ButtonGroup variant='text' className='buttonGroup'>
                        <Tooltip title={"Mute stream"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
                            <Button disableRipple onClick={toggleMuteStream}>
                                {muted ? <VolumeOff /> : <VolumeUp />}
                            </Button>
                        </Tooltip>
                        <Tooltip title={"Stop watching"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
                            <Button disableRipple onClick={stopWaching}>
                                <CancelPresentation />
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </ThemeProvider>
            </Grid>
        </div>
    )
}

export default ScreenShareControlIcons;