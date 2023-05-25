import React from 'react'
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

function Room({roomName, users}) {
  return (
    <div className='room'>
        <p className='roomName'>Depression Room</p>
        <div className="roomUsers">
            <AvatarGroup max={5}>
            {
                users.map((user) => (
                <Avatar key={user.nick} src={user.img}/>
                ))
            }
            </AvatarGroup>
        </div>
    </div>
  )
}

export default Room