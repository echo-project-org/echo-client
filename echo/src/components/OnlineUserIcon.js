import { Badge, Avatar } from '@mui/material'
import React from 'react'

function OnlineUserIcon({imgUrl, nick, talking}) {
  return (
    <div className="onlineUserIcon">
      <Badge badgeContent={1} variant="dot" anchorOrigin={{vertical: 'bottom', horizontal: 'right',}} showZero={true} invisible={!talking} color={"success"}>
        <Avatar alt={nick} src={imgUrl} sx={{height: '3.5rem', width:'3.5rem'}}/>
      </Badge>
      <p className='onlineUserNick'>{nick}</p>
    </div>
  )
}

OnlineUserIcon.defaultProps = {
    imgUrl: "https://kurickigabriele2020.altervista.org/Kury.jpg",
    nick: "Kury",
    talking: false,
}

export default OnlineUserIcon