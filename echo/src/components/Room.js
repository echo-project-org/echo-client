import { useState, useEffect } from 'react';
import OnlineUserIcon from './OnlineUserIcon'
import { Divider } from '@mui/material'

function Room({ users, onClick, data }) {
  const [usersInRoom, setRoomUsers] = useState({});

  const handleClick = () => {
    onClick(data.id);
  }

  useEffect(() => {
    console.log(data);
    console.log(users);
    var newUsers = new Map();
    for (var i in users) {
      newUsers.set(users[i].id, users[i]);
    }
    console.log(newUsers)
    setRoomUsers(newUsers);
  }, [])
  
  return (
    <div className='room' onClick={handleClick}>
        <p className='roomName'>{data.name}</p>
        <div className="roomUsers">
            {
              usersInRoom.map(user => (
                <OnlineUserIcon key={user.nick} imgUrl={user.img} nick={user.nick} />
              ))
            }
        </div>
    </div>
  )
}

export default Room