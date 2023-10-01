import "../../css/chatinput.css";

import { useState, useEffect, useRef } from 'react'
import { Emoji, EmojiStyle } from "emoji-picker-react";

import MessageBoxButtons from './MessageBoxButtons';
import UploadBoxButtons from './UploadBoxButtons';
import ChatBox from './ChatBox.ts';

import { ep, storage } from "../../index";

const api = require("../../api");

const newMessageSound = require("../../audio/newmessage.mp3");
const newSelfMessageSound = require("../../audio/newmessageself.mp3");

function ChatControls({ onEmojiOn, roomId }) {
  const [message, setMessage] = useState({ html: "" });
  // const message = useRef('');
  const [pressedEmoji, setPressedEmoji] = useState({});
  // const [selectionPosition, setSelectionPosition] = useState(0);
  // const [focusedChatLine, setFocusedChatLine] = useState(0);
  // const [chatLines, setChatLines] = useState([{ position: 0, message: "" }]);
  // const [prevKey, setPrevKey] = useState("");
  // const inputRef = useRef(null);

  const newMessageAudio = new Audio(newMessageSound);
  newMessageAudio.volume = 0.6;
  const newSelfMessageAudio = new Audio(newSelfMessageSound);
  newSelfMessageAudio.volume = 0.6;

  const sendChatMessage = (e) => {
    if (document.getElementById("messageBox").value === "") return;
    const message = document.getElementById("messageBox").value.replace(/\n/g, "<br>");
    document.getElementById("messageBox").value = "";
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

    ep.on("selectedEmoji", "ChatControls.selectedEmoji", (data) => {
      console.log("ChatControls.selectedEmoji", data);
      setPressedEmoji(data);
    });

    return () => {
      ep.releaseGroup("ChatControls.receiveChatMessage");
      ep.releaseGroup("ChatControls.selectedEmoji");
    }
  }, [])

  useEffect(() => {
    if (pressedEmoji.unified === undefined) return;
    // message.current += "\\" + pressedEmoji.unified;
    // setMessage({ html: message.html + "\\" + pressedEmoji.unified })
    // insert the emoji on the current focus position
    // console.log(window.getSelection())
    window.getSelection().getRangeAt(0).insertNode(document.createTextNode("\\" + pressedEmoji.unified));
  }, [pressedEmoji])

  const handleChange = (e) => {
    if (e.target.value !== "<div><br></div>" && e.target.value.indexOf("<div>") !== 0) {
      // wrap the first text in a div
      e.target.value = e.target.value.split("<div>").map((word, wordIndex) => {
        console.log("word, wordIndex", word, wordIndex)
        if (wordIndex === 0) {
          return "<div>" + word + "</div>";
        } else {
          return "<div>" + word;
        }
      });
    }
    // check if all the text is incapsulated in a div, if so remove it
    if (e.target.value.indexOf("<div>") === 0 && e.target.value.lastIndexOf("</div>") === e.target.value.length - 6) {
      e.target.value = e.target.value.substring(5, e.target.value.length - 6);
    }
    // make array into string
    console.log(e.target.value)
    if (typeof e.target.value !== "string") e.target.value = e.target.value.join("");
    setMessage({ html: e.target.value });
  }

  return (
    <div className='chatControls'>
      <div className='chatInputContainer'>
        <div className="messageBoxButtons">
          <UploadBoxButtons onClick={() => { console.log("click upload") }} />
        </div>
          <ChatBox
            className='chatInputText'
            id='chatInputText'
            html={message.html} // innerHTML of the editable div
            disabled={false} // use true to disable edition
            onChange={handleChange} // handle innerHTML change
            spellCheck={false}
            suppressContentEditableWarning={true}
          />
        {/* <div className='chatInputText' id='chatInputText'>
          <div
            id="message"
            className="message"
            onKeyDown={computeKeyPress}
            contentEditable={true}
            spellCheck={false}
            suppressContentEditableWarning={true}
          >
            {computeMessage()}
          </div>
        </div> */}
        <div className="messageBoxButtons">
          <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatControls