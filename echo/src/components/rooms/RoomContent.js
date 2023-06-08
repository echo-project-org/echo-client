import "../../css/chat.css";

import React from 'react'
import Chat from '../chat/Chat'
import ChatControls from '../chat/ChatControls'

function RoomContent({ roomId }) {
  return (
    <div className='roomContent'>
      <Chat currentRoomId={roomId} />
      <ChatControls />
    </div>
  )
}

export default RoomContent