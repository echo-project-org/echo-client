import React from 'react'

function MessageRight({ sender, text }) {
  return (
    <div className='rightMessage'>
        <div className="rightMessageText">
            {text}
        </div>
    </div>
  )
}

export default MessageRight