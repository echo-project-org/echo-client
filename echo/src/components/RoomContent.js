import React from 'react'
import Chat from './Chat'
import ChatControls from './ChatControls'

function RoomContent() {
  return (
    <div className='roomContent'>
        <Chat />
        <ChatControls />
    </div>
  )
}

export default RoomContent