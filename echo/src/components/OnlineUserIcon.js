import { Badge, Avatar, Divider } from '@mui/material'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import React from 'react'

const decodeUrl = (url) => {
  if(url.includes("/")){
    return url;
  } else {
    return decodeURIComponent(url);
  }
}

function OnlineUserIcon({imgUrl, nick, talking, audioVolume}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userVolume, setUserVolulme] = React.useState(0.5);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleVolumeChange = (event, newValue) => {
    //set user volume
    setUserVolulme(newValue);
  };


  return (
    <div>
      <div> 
        <div className="onlineUserIcon noselect pointer" onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}>
          <Badge badgeContent={1} variant="dot" anchorOrigin={{vertical: 'bottom', horizontal: 'right',}} showZero={true} invisible={!talking} color={"success"}>
            <Avatar alt={nick} src={decodeUrl(imgUrl)} sx={{height: '3.5rem', width:'3.5rem'}}/>
          </Badge>
          <p className='onlineUserNick'>{nick}</p>
        </div>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'userIcon',
            'className': 'userMenuModal'
          }}
        > 
          <MenuItem>
            <div style={{width: "100%"}}>
              <Stack spacing={2} direction="row" alignItems="center">
                <VolumeDown />
                <Slider aria-label="Volume" value={userVolume} onChange={handleVolumeChange} />
                <VolumeUp />
              </Stack>
            </div>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleClose}>Send private message</MenuItem>
          <MenuItem onClick={handleClose}>Kick</MenuItem>
          <MenuItem onClick={handleClose}>Ban</MenuItem>
          <MenuItem onClick={handleClose}>Close menu</MenuItem>
        </Menu>
      </div>
    </div>
  )
}

OnlineUserIcon.defaultProps = {
    imgUrl: "https://kurickigabriele2020.altervista.org/Kury.jpg",
    nick: "Kury",
    talking: false,
    audioVolume: 0.5,
}

export default OnlineUserIcon