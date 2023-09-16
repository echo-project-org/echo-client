import "../../css/chat.css";

import { useState, useEffect } from 'react'
import RoomContentChat from "./RoomContentChat";




function RoomContent({ roomId }) {
  const [hasUsersStreaming, setHasUsersStreaming] = useState(false);

  return (
    RoomContentChat({ roomId })
  )
}

export default RoomContent