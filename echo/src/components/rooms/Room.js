import React from 'react'
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

function Room({ active, onClick, data }) {
  return (
    <div>
      {active ? <ActiveRoom users={data.users} data={data} onClick={onClick} /> : <InactiveRoom users={data.users} data={data} onClick={onClick} />}
    </div>
  )
}

export default Room