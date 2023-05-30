import React from 'react'
import Avatar from '@mui/material/Avatar';

function MessageLeft({ sender, text }) {
  return (
    <div className='leftMessage'>
      <Avatar alt={sender.nick} src={sender.img} sx={{ width: "1.5rem", height: "1.5rem" }}/>
        <div className="leftMessageText">
            {text}
        </div>
    </div>
  )
}

export default MessageLeft