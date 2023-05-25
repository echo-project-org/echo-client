import React from 'react'
import MessageRight from './MessageRight'
import MessageLeft from './MessageLeft'

function Chat() {
  return (
    <div className='chat'>
        <MessageLeft text={"Grazie Kury"} />
        <MessageRight text={"Dallas fai schifo"} />
        <MessageRight text={"Volevo dire una cosa"} />
        <MessageRight text={"Ciao"} />

    </div>
  )
}

export default Chat