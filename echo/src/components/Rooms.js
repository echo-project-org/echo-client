import { useState, useEffect } from 'react';
import EmptyRoom from './EmptyRoom';
import Room from './Room';
import InactiveRoom from './InactiveRoom';

const ep = require("../echoProtocol");
const api = require("../api");

function Rooms({ }) {
  const [roomId, setRoomId] = useState(0);
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
    console.log("joining", joiningId)
    setRoomId(joiningId);
  }

  useEffect(() => {
    api.getRooms()
      .then((result) => {
        setRemoteRooms(result);
      });
  }, []);


  return (
    <div className='roomsContainer'>
      {
        remoteRooms.map((room) => (
          <Room key={room.id} users={room.users} onClick={onRoomClick} data={room}/>
        ))
      }
    </div>
  )
}

export default Rooms