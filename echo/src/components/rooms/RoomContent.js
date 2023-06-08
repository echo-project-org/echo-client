import "../../css/chat.css";

import React from 'react'
import Chat from '../chat/Chat'
import ChatControls from '../chat/ChatControls'

function RoomContent() {
  return (
    <div className='roomContent'>
      <Chat />
      <ChatControls />
    </div>
  )
}

export default RoomContent