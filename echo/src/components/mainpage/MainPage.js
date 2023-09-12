import { motion } from 'framer-motion'
import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';
import { useState, useEffect } from 'react';

import { ep } from "../../index";

var api = require('../../api')

function MainPage() {
  const [roomId, setRoomId] = useState(0);

  const updateCurrentRoom = (joiningId) => {
    console.log("Changed room in main Main page", joiningId);
    setRoomId(joiningId);
  }

  useEffect(() => {
    api.call("rooms")
      .then((result) => {
        if (result.json.length > 0) {
          result.json.forEach((room) => {
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
  });

  return (
    <motion.div
      className='mainScreen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className='sideWithChat'>
        <Sidebar updateCurrentRoom={updateCurrentRoom} />
        <RoomContent roomId={roomId} />
      </div>

    </motion.div>
  )
}

MainPage.defaultProps = {
}

export default MainPage