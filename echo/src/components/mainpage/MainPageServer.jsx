import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';
import { useState, useEffect } from 'react';

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
    <StylingComponents.MainPageServer.StyledServerContainer>
      <Sidebar updateCurrentRoom={updateCurrentRoom} />
      <RoomContent roomId={roomId} />
    </StylingComponents.MainPageServer.StyledServerContainer>
  )
}

MainPageServer.defaultProps = {
}

export default MainPageServer