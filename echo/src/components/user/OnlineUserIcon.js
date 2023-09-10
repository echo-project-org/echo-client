import '../../css/onlineusers.css'

import { Badge, Avatar, Divider, Menu, MenuItem, Stack, Slider, Grid } from '@mui/material'
import { VolumeUp, Message, DoDisturb, Gavel, Settings, MicOffRounded, VolumeOff } from '@mui/icons-material';
import { useState, useEffect } from 'react'

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { ep } from "../../index";

const decodeUrl = (url) => {
  if (url.includes("/")) {
    return url;
  } else {
    return decodeURIComponent(url);
  }
}

const theme = createTheme({
  components: {
    MuiMenu: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          background: "none"
        },
        paper: {
          borderRadius: '10px',
          background: "none",
          boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)"
        },
        list: {
          borderRadius: '10px',
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

function OnlineUserIcon({ imgUrl, name, id, talking }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userVolume, setUserVolulme] = useState(100);
  const [deaf, setDeaf] = useState(false);
  const [muted, setMuted] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    ep.off('updatedAudioState');
    ep.on("updatedAudioState", (data) => {
      if (data.id === id) {
        setDeaf(data.deaf);
        setMuted(data.muted);
      }
    });

    const audioState = ep.getAudioState(id);
    setDeaf(audioState.isDeaf);
    setMuted(audioState.isMuted);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleVolumeChange = (event, newValue) => {
    //set user volume
    setUserVolulme(newValue);
    ep.setUserVolume(newValue / 100, id)
  };

  id = id.toString();

  return (
    <div className="onlineUserContainer">
      <div
        className="onlineUserIcon noselect pointer"
        onContextMenu={handleClick}
        onClick={handleClick}
        size="small"
        aria-controls={ open ? 'account-menu' : undefined }
        aria-haspopup="true"
        aria-expanded={ open ? 'true' : undefined }
      >
        <Badge badgeContent={1} variant="dot" anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} showZero={true} invisible={!talking} color={"success"}>
          <Avatar alt={name} src={decodeUrl(imgUrl)} sx={{height: '1.25rem', width:'1.25rem'}}/>
        </Badge>
        <p className='onlineUserNick'>{name}</p>
        <Grid container direction="row" justifyContent="right" alignItems="center" sx={{ color: "white" }}>
          {deaf ? <VolumeOff fontSize="small" /> : null}
          {muted ? <MicOffRounded fontSize="small" /> : null}
        </Grid>
      </div>

      <ThemeProvider theme={theme}>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transitionDuration={ 100 }
          MenuListProps={{ 'aria-labelledby': 'userIcon', 'className': 'userMenuModal' }}
        >
          <div style={{ width: "100%", textAlign: "-webkit-center", marginBottom: ".3rem" }}>
            <Avatar alt={name} src={decodeUrl(imgUrl)} sx={{ height: '4rem', width:'4rem' }} style={{ border: "3px solid white" }}/>
            <p style={{ marginTop: ".8rem" }}>{name}</p>
          </div>

          <MenuItem>
            <div style={{ width: "100%" }}>
              <Stack spacing={2} direction="row" alignItems="center">
                <VolumeUp fontSize="10px" />
                <Slider
                  sx={{ width: 110 }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => { return v + "%" }}
                  aria-label="Volume"
                  value={userVolume}
                  onChange={handleVolumeChange}
                  size='medium'
                />
              </Stack>
            </div>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} variant='middle' />
          {localStorage.getItem("id") !== id ? <MenuItem onClick={handleClose}><Message fontSize="10px" style={{ marginRight: ".3rem" }}/>Send message</MenuItem> : null }
          {localStorage.getItem("id") !== id ? <MenuItem onClick={handleClose}><DoDisturb fontSize="10px" style={{ marginRight: ".3rem", color: "red" }}/>Kick</MenuItem> : null }
          {localStorage.getItem("id") !== id ? <MenuItem onClick={handleClose}><Gavel fontSize="10px" style={{ marginRight: ".3rem", color: "red" }}/> Ban</MenuItem> : null }
          {localStorage.getItem("id") === id ? <MenuItem onClick={handleClose}><Settings fontSize="10px" style={{ marginRight: ".3rem" }}/> Settings</MenuItem> : null }
        </Menu>
      </ThemeProvider>
    </div>
  )
}

OnlineUserIcon.defaultProps = {
  imgUrl: "http://localhost:6980/users/image/default",
  name: "None",
  talking: false,
}

export default OnlineUserIcon