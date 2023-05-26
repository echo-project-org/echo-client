import React from 'react'
import Room from './Room'
import EmptyRoom from './EmptyRoom'
import InactiveRoom from './InactiveRoom'

function Rooms({users}) {
  return (
    <div className='roomsContainer'>
        <Room users={users}/>
        <InactiveRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
        <EmptyRoom users={users}/>
    </div>
  )
}

export default Rooms