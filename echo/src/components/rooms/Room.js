import { useState, useEffect, Component } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

import { ep } from "../../index";

const api = require("../../api");

function Room({ active, data }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    ep.on("userJoinedChannel", (data) => {
      console.log("userJoinedChannel in Room", data)
      ep.updateUser(data.id, "currentRoom", data.roomId);
      updateUsersInRoom(data.roomId);
    });

    ep.on("userLeftChannel", (data) => {
      console.log("userLeftChannel in Room", data)
      ep.updateUser(data.id, "currentRoom", "0");
      updateUsersInRoom();
    });

    ep.on("usersCacheUpdated", (data) => {
      console.log("usersCacheUpdated in Room", data)
      updateUsersInRoom();
    });

    return () => {
      ep.off('userJoinedChannel');
      ep.off('userLeftChannel');
      ep.off('usersCacheUpdated');
    }
  }, []);

  const updateUsersInRoom = (roomId = false) => {
    console.log("-------------- updateUsersInRoom --------------")
    // get online users in room using data.id
    const users = ep.getUsersInRoom(data.id);
    console.log(users, data.id)
    console.log("users in Room route", users)
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