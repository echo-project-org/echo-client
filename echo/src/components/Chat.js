import React from 'react'
import MessageRight from './MessageRight'
import MessageLeft from './MessageLeft'

function Chat() {
  return (
    <div className='chat'>
        <MessageLeft sender={"Dallas"} text={"Grazie Kury"} />
        <MessageRight sender={"Kury"}text={"Dallas fai schifo"} />
        <MessageRight sender={"Kury"}text={"Volevo dire una cosa"} />
        <MessageRight sender={"Kury"} text={"Ciao"} />

    </div>
  )
}

export default Chat