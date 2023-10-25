import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';
import { useState, useEffect } from 'react';
import { Fade } from '@mui/material';
import { motion } from 'framer-motion'

import { ep } from "../../index";
import StylingComponents from '../../StylingComponents';

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
      <Fade in={true}>
        <StylingComponents.MainPageServer.StyledServerContainer>
          <Sidebar updateCurrentRoom={updateCurrentRoom} />
          <RoomContent roomId={roomId} />
        </StylingComponents.MainPageServer.StyledServerContainer>
      </Fade>
    </motion.div>
  )
}

MainPageServer.defaultProps = {
}

export default MainPageServer