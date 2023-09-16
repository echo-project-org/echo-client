import "../../css/chat.css";

import { useState, useEffect } from 'react'
import RoomContentChat from "./RoomContentChat";
import RoomContentScreenShares from "./RoomContentScreenShares";




function RoomContent({ roomId }) {
  const [hasUsersStreaming, setHasUsersStreaming] = useState(false);
  const [contentSelected, setContentSelected] = useState("screen");

  switch (contentSelected) {
    case "chat":
      return <RoomContentChat roomId={roomId} />
    case "screen":
      return <RoomContentScreenShares roomId={roomId} />
    default:
      return <RoomContentChat roomId={roomId} />
  }
}

export default RoomContent