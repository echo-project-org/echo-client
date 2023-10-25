import { useState, useEffect, Component } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

import { ep } from "../../index";

const api = require("../../api");

function Room({ active, data }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

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

  const updateUsersInRoom = () => {
    // get online users in room using data.id
    const users = ep.getUsersInRoom(data.id);
    setOnlineUsers(users);
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
    <>
      { active ? <ActiveRoom users={onlineUsers} data={data} /> : <InactiveRoom users={onlineUsers} data={data} /> }
    </>
  )
}

export default Room