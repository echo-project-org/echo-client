import React from 'react'
import Room from './Room'
import SecondRoom from './SecondRoom'
import ThirdRoom from './ThirdRoom'

function Rooms({users}) {
  return (
    <div className='roomsContainer'>
        <Room users={users}/>
        <SecondRoom users={users}/>
        <ThirdRoom users={users}/>
    </div>
  )
}

export default Rooms