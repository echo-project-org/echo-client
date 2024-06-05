import { useState, useEffect } from 'react';

import { ee, storage, ap, cm, ep } from "@root/index";
import StylingComponents from '@root/StylingComponents';

import Room from './Room';

const api = require("@lib/api");
const { error, info } = require("@lib/logger");

function Rooms({ setState, connected, updateCurrentRoom }) {
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
    info("[Rooms] Getting rooms list");
    let serverId = storage.get("serverId");
    api.call("rooms/" + serverId)
      .then((result) => {
        if (result.json.length > 0) {
          setRemoteRooms(result.json);
          result.json.forEach((room) => {
            cm.addRoom({ id: room.id, name: room.name, description: room.description, maxUsers: room.maxUsers });

            api.call("rooms/" + room.id + "/" + serverId + "/users")
              .then((res) => {
                if (res.ok && res.json.length > 0) {
                  res.json.forEach((user) => {
                    cm.addUser({ id: user.id, name: user.name, img: user.img, online: user.online, roomId: room.id, status: user.status });
                  });
                }
              })
              .catch((err) => {
                error(err);
              });
          });
        }
      })
      .catch((err) => {
        error(err);
      });
  }

  useEffect(() => {
    updateRooms();

    ee.on("needUserCacheUpdate", "Rooms.needUserCacheUpdate", (data) => {
      const id = data.id;
      const func = data.call;

      api.call("users/" + id, "GET")
        .then((res) => {
          if (res.ok) {
            const data = res.json;
            cm.addUser({ id: data.id, name: data.name, img: data.img, online: data.online, roomId: data.roomId });

            if (func) cm[func.function](func.args);
          }
        })
        .catch((err) => {
          error(err);
        });
    });

    ee.on("joinedRoom", "Rooms.joinedRoom", (data) => {
      info("[Rooms] Joined room", data);
      cm.updateUser({ id: sessionStorage.getItem("id"), field: "currentRoom", value: data });
      setActiveRoomId(data);
    });

    return () => {
      ee.releaseGroup("Rooms.needUserCacheUpdate");
      ee.releaseGroup("Rooms.joinedRoom");
    }
  }, []);

  useEffect(() => {
    if (!connected) {
      setActiveRoomId(0);
    }
  }, [connected]);


  return (
    <StylingComponents.Rooms.StyledRoomsContainer>
      {
        remoteRooms.map((room) => (
          <Room active={room.id === activeRoomId ? true : false} key={room.id} data={room} />
        ))
      }
    </StylingComponents.Rooms.StyledRoomsContainer>
  )
}

export default Rooms