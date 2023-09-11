import "../../css/rooms.css"
import { useState, useEffect } from 'react';
import Room from './Room';

import { ep } from "../../index";

const api = require("../../api");

const joinSound = require("../../audio/join.mp3");

function Rooms({ setState, connected, updateCurrentRoom }) {
  const joinAudio = new Audio(joinSound);
  joinAudio.volume = 0.6;

  const [activeRoomId, setActiveRoomId] = useState(0);
  const [remoteRooms, setRemoteRooms] = useState([
    {
      id: 0,
      name: "none",
      description: "none",
      img: "none"
    }
  ])

  const onRoomClick = (joiningId) => {
    if (activeRoomId !== 0) ep.exitFromRoom(localStorage.getItem("id"));
    ep.joinRoom(localStorage.getItem("id"), joiningId);
    ep.updateUser(localStorage.getItem("id"), "currentRoom", joiningId);
    api.call("rooms/join", "POST", { userId: localStorage.getItem("id"), roomId: joiningId })
      .then((res) => {
        if (res.ok) {
          console.log("joined room: ", joiningId)
          setActiveRoomId(joiningId)
          // send roomid to chatcontent to fetch messages
          updateCurrentRoom(joiningId);
          joinAudio.play();
          setState(true);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const updateRooms = () => {
    api.call("rooms")
      .then((result) => {
        setRemoteRooms(result.json);
      });
  }

  useEffect(() => {
    updateRooms();
  }, []);

  useEffect(() => {
    if (!connected) setActiveRoomId(0)
  }, [connected]);


  return (
    <div className='roomsContainer'>
      {
        remoteRooms.map((room) => (
          <Room active={room.id === activeRoomId ? true : false} key={room.id} onClick={onRoomClick} data={room} />
        ))
      }
    </div>
  )
}

export default Rooms