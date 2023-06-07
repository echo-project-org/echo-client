import { useState, useEffect } from 'react';
import Rooms from './Rooms'
import RoomControl from './RoomControl'
import { Divider } from '@mui/material'

function Sidebar({ }) {
  const [connectionState, setConnectionState] = useState(false);

  const updateConnectionState = (state) => {
    setConnectionState(state)
  }

  return (
    <div className='sidebar'>
      <RoomControl state={connectionState} setState={updateConnectionState} />
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <Rooms setState={updateConnectionState} connected={connectionState} />
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
    </div>
  )
}

export default Sidebar