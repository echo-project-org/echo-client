import { useState, useEffect } from 'react';
import Room from './Room';


const ep = require("../echoProtocol");
const api = require("../api");

function Rooms({ }) {
  const [roomId, setRoomId] = useState(0);
  const [activeRoomId, setActiveRoomId] = useState(0);
  const [remoteRooms, setRemoteRooms] = useState([
    {
      id: 0,
      name: "none",
      description: "none",
      img: "none",
      users: []
    }
  ])

  const onRoomClick = (joiningId) => {
    ep.joinRoom(localStorage.getItem("id"), joiningId);
    setRoomId(joiningId);
    setActiveRoomId(joiningId)
    let name = localStorage.getItem("username");
    api.call('setOnline/' + name + '/T/' + joiningId)
      .then((res) => {
        if (res.ok) {
          updateRooms();
        } else {
          console.error("Could not set user as online");
        }
      });
  }

  const updateRooms = () => {
    api.call("rooms")
      .then((result) => {
        console.log("rooms: ", result.json)
        setRemoteRooms(result.json);
      });
  }

  useEffect(() => {
    updateRooms();
  }, []);


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