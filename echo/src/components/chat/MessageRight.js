import React from 'react'
import Avatar from '@mui/material/Avatar';

function MessageRight({ message }) {
  return (
    <div className='rightMessage'>
      <Avatar alt={message.name} src={message.img} sx={{ width: "1.5rem", height: "1.5rem" }} />
      <div className="rightMessageText">
        {message.message}
      </div>
    </div>
  )
}

export default MessageRight