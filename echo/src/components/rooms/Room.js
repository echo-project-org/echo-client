import { useState, useEffect, Component } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

import { ep } from "../../index";

const api = require("../../api");

function Room({ active, data }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    ep.on("userJoinedChannel", "Room.userJoinedChannel", (data) => {
      // console.log("Room.userJoinedChannel", data);
      updateUsersInRoom(data.roomId);
    });

    ep.on("userLeftChannel", "Room.userLeftChannel", (data) => {
      // console.log("Room.userLeftChannel", data);
      ep.updateUser({ id: data.id, field: "currentRoom", value: "0" });
      updateUsersInRoom();
    });

    ep.on("usersCacheUpdated", "Room.usersCacheUpdated", (_) => {
      // console.log("Room.usersCacheUpdated", data);
      updateUsersInRoom();
    });

    return () => {
      ep.releaseGroup('Room.userJoinedChannel');
      ep.releaseGroup('Room.userLeftChannel');
      ep.releaseGroup('Room.usersCacheUpdated');
    }
  }, []);

  const updateUsersInRoom = () => {
    // get online users in room using data.id
    const users = ep.getUsersInRoom(data.id);
    // console.log(users, data.id)
    // console.log("users in Room route", users)
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
    <div>
      { active ? <ActiveRoom users={onlineUsers} data={data} /> : <InactiveRoom users={onlineUsers} data={data} /> }
    </div>
  )
}

export default Room