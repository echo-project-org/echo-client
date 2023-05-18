import React from 'react'
import OnlineUserIcon from './OnlineUserIcon'

function OnlineUsers({users}) {
  return (
    <div className='onlineUsersBar'>
      {
          users.map((user) => (
            <OnlineUserIcon key={user.nick} imgUrl={user.img} nick={user.nick}/>
          ))
      }
    </div>
  )
}

export default OnlineUsers