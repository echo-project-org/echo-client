import React from 'react'
import OnlineUserIcon from './OnlineUserIcon'
import { Divider } from '@mui/material'

function Room({roomName, users}) {
  return (
    <div className='room'>
        <p className='roomName'>Depression Room</p>
        <div className="roomUsers">
            {
                users.map((user) => (
                  <OnlineUserIcon key={user.nick} imgUrl={user.img} nick={user.nick} />
                ))
            }
        </div>
    </div>
  )
}

export default Room