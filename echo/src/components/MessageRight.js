import React from 'react'
import Avatar from '@mui/material/Avatar';

function MessageRight({ sender, text }) {
  return (
    <div className='rightMessage'>
    <Avatar alt={sender.name} src={sender.img} sx={{ width: "1.5rem", height: "1.5rem" }}/>
        <div className="rightMessageText">
            {text}
        </div>
    </div>
  )
}

export default MessageRight