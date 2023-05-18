import React from 'react'
import {AvatarGroup} from '@mui/material'
import Badge from '@mui/material'
import OnlineUserIcon from './OnlineUserIcon'

function OnlineUsers({users}) {
  return (
    <div className='onlineUsersBar'>
      {
          users.map((user) => (
            <OnlineUserIcon key={user.nick} imgUrl={user.img} nick={user.nick}/>
          ))
      }
    </div>
  )
}

export default OnlineUsers