import "../../css/rooms.css"
import { useState, useEffect } from 'react';
import Room from './Room';

import { ep, storage } from "../../index";

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
                    ep.addUser({ id: user.id, name: user.name, img: user.img, online: user.online, roomId: room.id });
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
      const currentRoom = ep.getUser(storage.get("id")).currentRoom;
      if (String(joiningId) === currentRoom) return;
      if (currentRoom !== 0) ep.exitFromRoom(storage.get("id"));
      // update audio state of the user
      const userAudioState = ep.getAudioState();
      ep.updateUser({ id: storage.get("id"), field: "muted", value: userAudioState.isMuted });
      ep.updateUser({ id: storage.get("id"), field: "deaf", value: userAudioState.isDeaf });
      // join room
      ep.joinRoom(storage.get("id"), joiningId);
      ep.updateUser({ id: storage.get("id"), field: "currentRoom", value: String(joiningId) });
      // update active room id
      setActiveRoomId(joiningId);
      // send roomid to chatcontent to fetch messages
      updateCurrentRoom(joiningId);
      api.call("rooms/join", "POST", { userId: storage.get("id"), roomId: joiningId })
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

    ep.on("needUserCacheUpdate", "Rooms.needUserCacheUpdate", (data) => {
      const id = data.id;
      const func = data.call;
      
      api.call("users/" + id, "GET")
        .then((res) => {
          if (res.ok) {
            const data = res.json;
            ep.addUser({ id: data.id, name: data.name, img: data.img, online: data.online, roomId: data.roomId });

            if (func) ep[func.function](func.args);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    });

    return () => {
      ep.releaseGroup("Rooms.roomClicked");
      ep.releaseGroup("Rooms.needUserCacheUpdate");
    }
  }, []);

  useEffect(() => {
    if (!connected) {
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