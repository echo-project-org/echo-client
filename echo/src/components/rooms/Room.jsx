import { useState, useEffect } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

import { ee, ap } from "@root/index";
import { info } from "@lib/logger";

function Room({ active, data: _data }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    ee.on("userJoinedChannel", "Room.userJoinedChannel", (data) => {
      updateUsersInRoom(data);
      // ap.playOtherJoinSound();
    });

    ee.on("userLeftChannel", "Room.userLeftChannel", (data) => {
      ep.updateUser({ id: data.id, field: "currentRoom", value: "0" });
      updateUsersInRoom();
    });

    ee.on("usersCacheUpdated", "Room.usersCacheUpdated", (_) => {
      updateUsersInRoom();
    });

    return () => {
      ee.releaseGroup("Room.userJoinedChannel");
      ee.releaseGroup("Room.userLeftChannel");
      ee.releaseGroup("Room.usersCacheUpdated");
    }
  }, []);

  /**
   * 
   * @param {Object} data object with informations about the user that joined the room (also called when me joins the room)
   */
  const updateUsersInRoom = () => {
    // TODO get online users in room using data.id
    const users = ep.getUsersInRoom(_data.id);
    setOnlineUsers(users);
  }

  useEffect(() => { if (!active) updateUsersInRoom(); }, [active])
  useEffect(() => updateUsersInRoom(), [])

  return (
    <>
      {active ? <ActiveRoom users={onlineUsers} data={_data} /> : <InactiveRoom users={onlineUsers} data={_data} />}
    </>
  )
}

export default Room