import React from 'react'

import RoomContentChat from "./chat/RoomContentChat";
import RoomContentScreenShares from "./screenShare/RoomContentScreenShares";
import RoomContentFriends from "./friends/RoomContentFriends";

function InternalRoomContent({ contentSelected, roomId }) {
    switch (contentSelected) {
        case "chat":
            return <RoomContentChat roomId={roomId} key={'chat'} />
        case "screen":
            return <RoomContentScreenShares roomId={roomId} key={'screen'} />
        case "friends":
            return <RoomContentFriends key={'friends'} />
        default:
            return <RoomContentFriends key={'friends'} />
    }
}

export default InternalRoomContent