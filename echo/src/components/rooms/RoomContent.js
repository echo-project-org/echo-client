import "../../css/chat.css";

import { useState, useEffect } from 'react'
import RoomContentChat from "./RoomContentChat";




function RoomContent({ roomId }) {
  const [hasUsersStreaming, setHasUsersStreaming] = useState(false);
  const [contentSelected, setContentSelected] = useState("chat");

  return (
    contentSelected === "chat" ?
      <RoomContentChat roomId={roomId} />
      :
      <></>
  )
}

export default RoomContent