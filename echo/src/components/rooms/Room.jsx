import { useState, useEffect } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

import { ep, ap } from "../../index";

// const api = require("../../lib/api");

function Room({ active: _active, data: _data }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    ep.on("userJoinedChannel", "Room.userJoinedChannel", (data) => {
      updateUsersInRoom(data.roomId);
    });

    ep.on("userLeftChannel", "Room.userLeftChannel", (data) => {
      ep.updateUser({ id: data.id, field: "currentRoom", value: "0" });
      updateUsersInRoom();
    });

    ep.on("usersCacheUpdated", "Room.usersCacheUpdated", (_) => {
      updateUsersInRoom();
    });

    return () => {
      ep.releaseGroup("Room.userJoinedChannel");
      ep.releaseGroup("Room.userLeftChannel");
      ep.releaseGroup("Room.usersCacheUpdated");
    }
  }, []);

  const updateUsersInRoom = (data) => {
    // get online users in room using data.id
    const users = ep.getUsersInRoom(_data.id);
    setOnlineUsers(users);
    if (data && data.roomId === String(_data.id)) {
      setActive((prev) => {
        if (prev && !_active) ap.playOtherJoinSound();
        return _active;
      });
    }
  }

  useEffect(() => { setActive(_active); if (!_active) updateUsersInRoom(); }, [_active])
  useEffect(() => updateUsersInRoom(), [])

  return (
    <>
      {active ? <ActiveRoom users={onlineUsers} data={_data} /> : <InactiveRoom users={onlineUsers} data={_data} />}
    </>
  )
}

export default Room