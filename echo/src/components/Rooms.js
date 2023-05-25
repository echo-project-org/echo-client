import React from 'react'
import Room from './Room'

function Rooms({users}) {
  return (
    <div className='roomsContainer'>
        <Room users={users}/>
    </div>
  )
}

export default Rooms