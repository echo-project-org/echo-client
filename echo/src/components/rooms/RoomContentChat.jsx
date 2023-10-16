import React from 'react'
import { useState, useEffect } from 'react'
import { Container, styled } from '@mui/material'

import Chat from '../chat/Chat'
import ChatControls from '../chat/ChatControls'
import EmojiPicker from "../chat/EmojiPicker";

import { ep } from "../../index";

function RoomContentChat({ roomId }) {
  const [emojiPicker, setEmojiPicker] = useState(false);
  const handleEmojiPicker = () => {
    setEmojiPicker(!emojiPicker);
  };

  const closeEmojiPicker = () => {
    setEmojiPicker(false);
  };

  useEffect(() => {
    ep.on("selectedEmoji", "RoomContentChat.selectedEmoji", (data) => {
      closeEmojiPicker()
    });

    return () => {
      ep.releaseGroup("RoomContentChat.selectedEmoji");
    }
  }, []);

  return (
    <>
      <Chat currentRoomId={roomId} onMouseDown={closeEmojiPicker} />
      <ChatControls onEmojiOn={handleEmojiPicker} roomId={roomId} />
      <EmojiPicker show={emojiPicker} style={{
        position: "absolute",
        bottom: "5rem",
        right: "1rem",
        zIndex: "1000",
      }}
      />
    </>
  )
}

export default RoomContentChat