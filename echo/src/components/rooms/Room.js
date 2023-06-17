import { useState, useEffect } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

const api = require("../../api");

function Room({ active, onClick, data }) {
  const [onlineUsers, setOnlineUsers] = useState([])

  const _onClick = () => {
    if (active) return;
    onClick(data.id);
    updateUsersInRoom();
  }

  const updateUsersInRoom = () => {
    // get online users in room using data.id
    api.call("rooms/" + data.id + "/users")
      .then((result) => {
        setOnlineUsers(result.json);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    if (!active) {
      updateUsersInRoom();
    }
  }, [active])

  useEffect(() => {
    updateUsersInRoom();
  }, [])

  return (
    <div>
      { active ? <ActiveRoom users={onlineUsers} data={data} onClick={_onClick} /> : <InactiveRoom users={onlineUsers} data={data} onClick={_onClick} /> }
    </div>
  )
}

export default Room