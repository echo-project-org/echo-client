import React from 'react'

import RoomContentChat from "./RoomContentChat";
import RoomContentScreenShares from "./RoomContentScreenShares";
import RoomContentFriends from "./RoomContentFriends";

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