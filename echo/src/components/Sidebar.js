import React from 'react'
import RoomControl from './RoomControl'
import { Divider } from '@mui/material'

function Sidebar({}) {

  return (
    <div className='sidebar'>
      <RoomControl />
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
    </div>
  )
}

export default Sidebar