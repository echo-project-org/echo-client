import { useState, useEffect } from 'react';
import Rooms from '../rooms/Rooms'
import RoomControl from '../rooms/RoomControl'
import { Divider } from '@mui/material'

function Sidebar({ updateCurrentRoom }) {
  const [connectionState, setConnectionState] = useState(false);

  const updateConnectionState = (state) => {
    setConnectionState(state)
  }

  return (
    <div className='sidebar'>
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <Rooms setState={updateConnectionState} connected={connectionState} updateCurrentRoom={updateCurrentRoom} />
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <RoomControl state={connectionState} setState={updateConnectionState} />
    </div>
  )
}

export default Sidebar