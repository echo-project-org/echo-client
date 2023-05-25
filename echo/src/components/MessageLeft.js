import React from 'react'

function MessageLeft({ sender, text }) {
  return (
    <div className='leftMessage'>
        <div className="leftMessageText">
            {text}
        </div>
    </div>
  )
}

export default MessageLeft