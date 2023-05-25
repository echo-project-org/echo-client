import { Badge, Avatar, IconButton } from '@mui/material'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react'

const decodeUrl = (url) => {
  if(url.includes("/")){
    return url;
  } else {
    return decodeURIComponent(url);
  }
}
function OnlineUserIcon({imgUrl, nick, talking}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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
          }}
        > 
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
}

export default OnlineUserIcon