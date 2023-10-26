import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';
import { useState, useEffect } from 'react';

import { ep } from "../../index";
import StylingComponents from '../../StylingComponents';
import { motion } from 'framer-motion';
// const api = require('../../api');

function MainPageServer() {
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
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
    >
      <StylingComponents.MainPageServer.StyledServerContainer>
        <Sidebar updateCurrentRoom={updateCurrentRoom} />
        <RoomContent roomId={roomId} />
      </StylingComponents.MainPageServer.StyledServerContainer>
    </motion.div>
  )
}

MainPageServer.defaultProps = {
}

export default MainPageServer