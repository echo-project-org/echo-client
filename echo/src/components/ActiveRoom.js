import { useState, useEffect } from 'react';
import OnlineUserIcon from './OnlineUserIcon'
import { Divider } from '@mui/material'

function ActiveRoom({ users, onClick, data }) {
  const handleClick = () => {
    onClick(data.id);
  }

  useEffect(() => {
  }, [])
  
  return (
    <div className='room' onClick={handleClick}>
        <p className='roomName noselect'>{data.name}</p>
        <div className="roomUsers">
            {
              users.map(user => (
                <OnlineUserIcon key={user.name} imgUrl={user.img} name={user.name} />
              ))
            }
        </div>
    </div>
  )
}

export default ActiveRoom