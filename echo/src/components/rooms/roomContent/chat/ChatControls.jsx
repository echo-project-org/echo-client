import "@css/chatinput.css";

import { useState, useEffect } from 'react'

import MessageBoxButtons from './MessageBoxButtons';
import UploadBoxButtons from './UploadBoxButtons';

import { ep, storage, ap } from "@root/index";
import StylingComponents from "@root/StylingComponents";

const api = require("@lib/api");
const { error, log, info } = require("@lib/logger");

function ChatControls({ onEmojiOn, roomId }) {
  const [message, setMessage] = useState("");

  const sendChatMessage = (e) => {
    info("[ChatControls] User sent a message")
    if (!message) return;
    if (message.length === 0) return;
    log("about to send this message", message, roomId, sessionStorage.getItem("id"));
    setMessage((prev) => {
      if (!prev) return;
      if (prev.length === 0) return;
      prev = prev.trim();
      ep.sendChatMessage({ room: roomId, roomId, serverId: storage.get('serverId'), userId: sessionStorage.getItem("id"), message: prev, self: true, date: new Date().toISOString() });
      return "";
    });
  }

  useEffect(() => {
    ep.on("receiveChatMessage", "ChatControls.receiveChatMessage", (data) => {
      if (String(data.userId) === sessionStorage.getItem("id")) {
        ap.playNewSelfMessageSound();
        data.userId = Number(data.id);
        // make api call after the server received it
        api.call("rooms/messages", "POST", data)
          .then((res) => {
            log("message sent", res);
          })
          .catch((err) => {
            error(err);
          });
      } else {
        ap.playNewMessageSound();
      };
    });

    ep.on("selectedEmoji", "ChatControls.selectedEmoji", (data) => {
      setMessage((prev) => {
        return prev + " " + data.emoji + " ";
      });
    });

    return () => {
      ep.releaseGroup("ChatControls.receiveChatMessage");
      ep.releaseGroup("ChatControls.selectedEmoji");
    }
  }, [])

  return (
    <div className='chatControls'>
      <div className='chatInputContainer'>
        <div className="messageBoxButtons">
          <UploadBoxButtons onClick={() => { log("click upload") }} />
        </div>
        <div
          className='chatInputText'
          id='chatInputText'
        >
          <StylingComponents.Rooms.StyledTextBoxChat
            multiline={true}
            maxRows={10}
            // autoFocus
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          >
            
          </StylingComponents.Rooms.StyledTextBoxChat>
        </div>
        <div className="messageBoxButtons">
          <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatControls