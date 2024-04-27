import React from 'react'
import { useState, useEffect } from 'react'
import { Container, styled } from '@mui/material'

import Chat from './Chat'
import ChatControls from './ChatControls'
import EmojiPicker from "./EmojiPicker";

import { ep } from "@root/index";
import { info } from "@lib/logger";

function RoomContentChat({ roomId }) {
  const [emojiPicker, setEmojiPicker] = useState(false);
  const handleEmojiPicker = () => {
    info("[RoomContentChat] Opening emoji picker")
    setEmojiPicker(!emojiPicker);
  };

  const closeEmojiPicker = () => {
    info("[RoomContentChat] Closing emoji picker")
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
      <EmojiPicker show={emojiPicker} />
    </>
  )
}

export default RoomContentChat