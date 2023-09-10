import { useState, useEffect, Component } from 'react';
import ActiveRoom from './ActiveRoom';
import InactiveRoom from './InactiveRoom';

import { ep } from "../../index";

const api = require("../../api");

function Room({ active, onClick, data }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  const _onClick = () => {
    if (active) return;
    onClick(data.id);
    updateUsersInRoom();
  }

  useEffect(() => {
    ep.off('userJoinedChannel');
    ep.on("userJoinedChannel", (data) => {
      console.log("userJoinedChannel in Room", data)
      updateUsersInRoom(data.roomId);
    });

    ep.off('userLeftChannel');
    ep.on("userLeftChannel", (data) => {
      console.log("userLeftChannel in Room", data)
      updateUsersInRoom(data.roomId);
    });
  }, []);

  const updateUsersInRoom = (roomId = false) => {
    // get online users in room using data.id
    console.log("rooms/" + (roomId ? roomId : data.id) + "/users")
    api.call("rooms/" + (roomId ? roomId : data.id) + "/users")
      .then((result) => {
        console.log("got users in room: ", result.json)
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