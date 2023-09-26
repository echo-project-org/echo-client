import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import MessageBoxButtons from './MessageBoxButtons';

import { ep, storage } from "../../index";

const api = require("../../api");

const newMessageSound = require("../../audio/newmessage.mp3");
const newSelfMessageSound = require("../../audio/newmessageself.mp3");

const StyledTextField = styled(TextField)({
  "& label": {
    color: "#f5e8da",
  },
  "& label.Mui-focused": {
    color: "#f5e8da",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#f5e8da",
  },
  "& .MuiInputBase-root": {
    color: "#f5e8da",
    backgroundColor: "#3e2542",
    zIndex: 2,
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#f5e8da",
    },
    "&:hover fieldset": {
      borderColor: "#f5e8da",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#f5e8da",
    },
    "& .MuiInputAdornment-root": {
      color: "#f5e8da",
      alignSelf: "flex-start",
      fixAlign: "flex-start",
      marginTop: "0.6rem",
    }
  }
});

function ChatControls({ onEmojiOn, roomId }) {
  const newMessageAudio = new Audio(newMessageSound);
  newMessageAudio.volume = 0.6;
  const newSelfMessageAudio = new Audio(newSelfMessageSound);
  newSelfMessageAudio.volume = 0.6;

  const sendChatMessage = (e) => {
    console.log(e);
    if (document.getElementById("messageBox").value === "") return;
    const message = document.getElementById("messageBox").value.replace(/\n/g, "<br/>");
    document.getElementById("messageBox").value = "";
    // replace all new lines with <br>
    ep.sendChatMessage({ roomId, userId: storage.get("id"), message, self: true, date: new Date().toISOString() });
  }

  useEffect(() => {
    ep.on("receiveChatMessage", "ChatControls.receiveChatMessage", (data) => {
      if (String(data.userId) === storage.get("id")) {
        newSelfMessageAudio.play();
        data.userId = Number(data.id);
        console.log("ChatControls.receiveChatMessage", data)
        // make api call after the server received it
        api.call("rooms/messages", "POST", data).then((res) => { }).catch((err) => { console.log(err); });
      } else {
        newMessageAudio.play();
      };
    });

    return () => {
      ep.releaseGroup("ChatControls.receiveChatMessage");
    }
  }, [])

  return (
    <div className='chatControls'>
      <StyledTextField
        id="messageBox"
        autoFocus
        onKeyDown={(e) => {
          // check if enter is pressed
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage(e);
          }
        }}
        onChange={(e) => {
          console.log("changed", e)
        }}
        fullWidth
        multiline
        maxRows={15}
        placeholder='Send a message...'
        InputProps={{
          endAdornment: <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />,
          style: { color: "#f5e8da" },
          maxLength: 3000,
        }}
        onInput = {(e) =>{
          e.target.value = e.target.value.slice(0, 3000)
        }}
      />
    </div>
  )
}

export default ChatControls