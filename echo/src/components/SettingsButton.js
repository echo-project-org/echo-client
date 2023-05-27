import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from "@mui/material/Tooltip";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Divider } from '@mui/material'
import MicIcon from '@mui/icons-material/Mic';
import React from 'react'

const theme = createTheme({
    components: {
        MuiMenu: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    background: "none"
                },
                paper: {
                    borderRadius: '20px',
                    background: "none",
                    boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)"
                },
                list: {
                    borderRadius: '20px',
                    boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)"
                }
            },
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
        MuiMenuItem: {
            defaultProps: {
                disableRipple: true
            },
            styleOverrides: {
                root: {
                    ":hover": {
                        backgroundColor: "rgba(0, 0, 0, .1)",
                        transitionDuration: ".1s"
                    }
                }
            }
        }
    },
});

function SettingsButton() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [micVolume, setMicVolulme] = React.useState(100);
    const open = Boolean(anchorEl);

    const handleMicVolumeChange = (event, newValue) => {
        //set user volume
        setMicVolulme(newValue);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Settings" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
                <Button>
                    <SettingsIcon onClick={handleClick} />
                </Button>
            </Tooltip>
            <ThemeProvider theme={theme}>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    transitionDuration={100}
                    MenuListProps={{
                        'aria-labelledby': 'userIcon',
                        'className': 'userMenuModal'
                    }}
                >   
                    <MenuItem>
                        <p className='onlineUserNick'>Audio settings</p>
                    </MenuItem>
                    <MenuItem>
                        <div style={{ width: "100%" }}>
                            <Stack spacing={2} direction="row" alignItems="center">
                                <MicIcon fontSize="10px" />
                                <Slider
                                    sx={{ width: 110 }}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(v) => { return v + "%" }}
                                    aria-label="Volume"
                                    value={micVolume}
                                    onChange={handleMicVolumeChange}
                                    size='medium'
                                />
                            </Stack>
                        </div>
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} variant='middle' />
                    <MenuItem>
                        Audio inputs here
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} variant='middle' />
                    <MenuItem>
                        Audio outputs here
                    </MenuItem>
                </Menu>
            </ThemeProvider>
        </>
    )
}

export default SettingsButton