import "../../css/chat.css";

import { useState, useEffect } from 'react'
import { Container, styled } from '@mui/material'

import Chat from '../chat/Chat'
import ChatControls from '../chat/ChatControls'
import EmojiPicker from "../chat/EmojiPicker";

import { ep } from "../../index";

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    margin: "0 0 0 1rem",
    height: "calc(100vh - 2rem)",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)"
  },
  [theme.breakpoints.up('lg')]: {
    margin: "0 0 0 1rem",
    height: "calc(100vh - 2rem)",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)"
  },
  [theme.breakpoints.up('xl')]: {
    margin: "0 0 0 1rem",
    height: "calc(100vh - 2rem)",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)"
  },
}));


function RoomContent({ roomId }) {
  const [emojiPicker, setEmojiPicker] = useState(false);

  const handleEmojiPicker = () => {
    // console.log("sto cambianto emojipicker", emojiPicker)
    setEmojiPicker(!emojiPicker);
  };

  useEffect(() => {
    
  });

  return (
    <StyledContainer>
      <Chat currentRoomId={roomId}/>
      <ChatControls onEmojiOn={handleEmojiPicker} />
      <EmojiPicker show={emojiPicker} style={{
          position: "absolute",
          bottom: "5rem",
          right: "1rem",
          zIndex: "1000",
        }}
      />
    </StyledContainer>
  )
}

export default RoomContent