import "../../css/chat.css";

import React from 'react'
import Chat from '../chat/Chat'
import ChatControls from '../chat/ChatControls'

import EmojiPicker from "../chat/EmojiPicker";

function RoomContent({ roomId }) {
  const [emojiPicker, setEmojiPicker] = React.useState(false);

  const handleEmojiPicker = () => {
    console.log("sto cambianto emojipicker", emojiPicker)
    setEmojiPicker(!emojiPicker);
  };

  return (
    <div className='roomContent'>
      
      <EmojiPicker show={emojiPicker} style={{
          position: "absolute",
          bottom: "5rem",
          right: "1rem",
          zIndex: "1000",
        }}
      />

      <Chat currentRoomId={roomId}/>
      <ChatControls onEmojiOn={handleEmojiPicker}/>
    </div>
  )
}

export default RoomContent