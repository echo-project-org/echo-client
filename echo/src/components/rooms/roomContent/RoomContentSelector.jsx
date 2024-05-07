import React, { useEffect, useState } from 'react'
import { ToggleButtonGroup, ToggleButton, Badge } from '@mui/material';
import { ChatBubble, PeopleAlt, Window } from '@mui/icons-material';
import { info } from '@lib/logger';
import { ee } from '@root';

function RoomContentSelector({ roomId, contentSelected, setContentSelected }) {
  const [nNewMessages, setNNewMessages] = useState(0);

  const control = {
    value: contentSelected,
    exclusive: true,
    onChange: (event, newAlignment) => {
      if (newAlignment === null) return;
      setContentSelected(newAlignment)
    },
  }

  useEffect(() => {
    info("[RoomContentSelector] Content selected changed: " + contentSelected)
    if (contentSelected === 'chat') {
      setNNewMessages(0);
    }
  }, [contentSelected]);

  const addMessage = (message) => {
    info("[RoomContentSelector] Adding message")
    if (contentSelected === 'chat') return;
    if (String(message.roomId) === String(roomId)) {
      setNNewMessages(nNewMessages + 1);
    }
  }

  useEffect(() => {
    ee.on("receiveChatMessage", "RoomContentSelector.receiveChatMessage", (message) => {
      addMessage(message);
    });

    ee.on("exitedFromRoom", "RoomContentSelector.exitedFromRoom", (data) => {
      setNNewMessages(0);
    });

    return () => {
      ee.releaseGroup("RoomContentSelector.receiveChatMessage");
      ee.releaseGroup("RoomContentSelector.exitedFromRoom");
    }
  });

  return (
    <ToggleButtonGroup size="small" {...control} aria-label="Small sizes">
      <ToggleButton value="friends" key="friends" disableRipple>
        <PeopleAlt />
      </ToggleButton>,
      <ToggleButton value="chat" key="chat" disableRipple disabled={String(roomId) === '0'}>
        <Badge badgeContent={nNewMessages} color="error">
          <ChatBubble />
        </Badge>
      </ToggleButton>,
      <ToggleButton value="screen" key="screen" disableRipple disabled={String(roomId) === '0'}>
        <Window />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default RoomContentSelector