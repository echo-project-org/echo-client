import { motion } from 'framer-motion'
import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';
import { useState, useEffect } from 'react';

import { ep } from "../../index";
// const api = require('../../api')

function MainPage() {
  const [roomId, setRoomId] = useState(0);

  const updateCurrentRoom = (joiningId) => {
    setRoomId(joiningId);
  }

  useEffect(() => {
    ep.on("exitedFromRoom", (data) => {
      setRoomId(0);
    })
  }, [roomId]);

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