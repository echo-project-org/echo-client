import React from 'react'
import Avatar from '@mui/material/Avatar';

function MessageLeft({ message }) {
  return (
    <div className='leftMessage'>
      <Avatar alt={message.name} src={message.img} sx={{ width: "1.5rem", height: "1.5rem" }} />
      <div className="leftMessageText">
        {message.message}
      </div>
    </div>
  )
}

export default MessageLeft