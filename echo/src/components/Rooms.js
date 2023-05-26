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
      maxUsers: 0 
    }
  ])

  const onRoomClick = (joiningId) => {
    console.log("joining", joiningId)
    setRoomId(joiningId);
  }

  useEffect(() => {
    console.log("sto cambiando")
  }, [remoteRooms]);

  useEffect(() => {
    // const getResult = async () => {
    //   const result = await api.getRooms();
    //   console.log(result);
    //   setRemoteRooms(result);
    // }

    // getResult();

    api.getRooms()
      .then((result) => {
        console.log(result);
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