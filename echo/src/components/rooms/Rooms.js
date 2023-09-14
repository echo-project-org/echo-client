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

  const updateRooms = () => {
    api.call("rooms")
      .then((result) => {
        if (result.json.length > 0) {
          setRemoteRooms(result.json);
          result.json.forEach((room) => {
            ep.addRoom({ id: room.id, name: room.name, description: room.description, maxUsers: room.maxUsers });
          
            api.call("rooms/" + room.id + "/users")
              .then((res) => {
                if (res.ok && res.json.length > 0) {
                  res.json.forEach((user) => {
                    ep.addUser({
                      id: user.id,
                      name: user.name,
                      img: user.img,
                      online: user.online,
                      roomId: room.id
                    });
                  });
                }
              })
              .catch((err) => {
                console.error(err);
              });
          });
        }
      });
  }

  useEffect(() => {
    updateRooms();

    ep.on("roomClicked", "Rooms.roomClicked", (data) => {
      if(!ep.isAudioFullyConnected()) {
        console.error("Audio is not fully connected yet. Please wait a few seconds and try again.");
        return;
      }

      const joiningId = data.roomId;
      const currentRoom = ep.getUser(localStorage.getItem("id")).currentRoom;
      console.log("roomClicked in Rooms", joiningId, currentRoom, String(joiningId) === currentRoom)
      console.log("roomClicked in Rooms", typeof joiningId, typeof currentRoom)
      if (String(joiningId) === currentRoom) return;
      if (currentRoom !== 0) ep.exitFromRoom(localStorage.getItem("id"));
      ep.joinRoom(localStorage.getItem("id"), joiningId);
      ep.updateUser(localStorage.getItem("id"), "currentRoom", String(joiningId));
      // update audio state of the user
      const userAudioState = ep.getAudioState();
      ep.updateUser(localStorage.getItem("id"), "muted", userAudioState.isMuted);
      ep.updateUser(localStorage.getItem("id"), "deaf", userAudioState.isDeaf);
      // update active room id
      setActiveRoomId(joiningId);
      // send roomid to chatcontent to fetch messages
      updateCurrentRoom(joiningId);
      api.call("rooms/join", "POST", { userId: localStorage.getItem("id"), roomId: joiningId })
        .then((res) => {
          if (res.ok) {
            joinAudio.play();
            setState(true);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    });

    return () => {
      ep.releaseGroup("Rooms.roomClicked");
    }
  }, []);

  useEffect(() => {
    if (!connected) {
      console.log("------------------ resetting activeRoomId")
      setActiveRoomId(0);
    }
  }, [connected]);


  return (
    <div className='roomsContainer'>
      {
        remoteRooms.map((room) => (
          <Room active={room.id === activeRoomId ? true : false} key={room.id} data={room} />
        ))
      }
    </div>
  )
}

export default Rooms