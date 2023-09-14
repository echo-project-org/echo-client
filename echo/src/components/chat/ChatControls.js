import React, { useEffect } from 'react'
import { createTheme, styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import MessageBoxButtons from './MessageBoxButtons';

import { ep } from "../../index";

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
      marginTop: "0.6rem"
    }
  }
});

const theme = createTheme({
  palette: {
    primary: { main: '#f5e8da', },
    secondary: { main: '#ce8ca5', },
  },
  typography: {
    fontFamily: ['Roboto Condensed'].join(','),
  },
});

function ChatControls({ onEmojiOn, roomId }) {

  const newMessageAudio = new Audio(newMessageSound);
  newMessageAudio.volume = 0.6;
  const newSelfMessageAudio = new Audio(newSelfMessageSound);
  newSelfMessageAudio.volume = 0.6;

  const sendChatMessage = () => {
    if (document.getElementById("messageBox").value === "") return;
    const message = document.getElementById("messageBox").value;
    document.getElementById("messageBox").value = "";
    const userId = localStorage.getItem("id");
    ep.sendChatMessage({ roomId, userId, message, self: true, date: new Date().toUTCString() });
  }

  useEffect(() => {
    ep.on("receiveChatMessage", "ChatControls.receiveChatMessage", (data) => {
      if (String(data.userId) === localStorage.getItem("id")) {
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
      <ThemeProvider theme={theme}>
        <div className="chatInputContainer">
          <StyledTextField
            id="messageBox"
            autoFocus
            onKeyDown={(e) => {
              // check if enter is pressed
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
              }
            }}
            fullWidth
            multiline
            maxRows={20}
            placeholder='Send a message...'
            InputProps={{
              endAdornment: <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />,
              style: { color: "#f5e8da" }
            }}
          />
        </div>
      </ThemeProvider>
    </div>
  )
}

export default ChatControls