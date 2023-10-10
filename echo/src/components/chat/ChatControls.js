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
  const inputRef = useRef(null);

  const newMessageAudio = new Audio(newMessageSound);
  newMessageAudio.volume = 0.6;
  const newSelfMessageAudio = new Audio(newSelfMessageSound);
  newSelfMessageAudio.volume = 0.6;

  const sendChatMessage = (e) => {
    console.log("about to send this message", message.html, inputRef.current.innerHTML)
    ep.sendChatMessage({ roomId, userId: storage.get("id"), message: message.html, self: true, date: new Date().toISOString() });
    setMessage({ html: "" });
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
    const emojiFormat = "[emoji:" + pressedEmoji.unified + "]";
    const s = window.getSelection();
    const r = s.getRangeAt(0);
    // if selection is the div@chatInputText, return
    console.log("s before", s)
    console.log('sfo:', s.focusOffset, 'sao:', s.anchorOffset, 'rso:', r.startOffset, 'reo:', r.endOffset, '»' + s.toString());
    console.log(s.focusNode.innerHTML)
    if (s.focusNode && s.focusNode.id === "chatInputText") {
      // add a div to the selection
      // s.focusNode.innerHTML = "<div><br></div>";
      return
    };
    console.log("s after", s)
    var node = s.focusNode.textContent;
    console.log("before", node)
    const cursorPosition = s.focusOffset;
    console.log(cursorPosition);
    let textBeforeCursorPosition = node.substring(0, cursorPosition)
    let textAfterCursorPosition = node.substring(cursorPosition, node.length)
    s.focusNode.textContent = textBeforeCursorPosition + emojiFormat + textAfterCursorPosition;
    console.log("after", node);
    // set the new value to the focused child node
    console.log(s.focusNode.textContent)
    console.log(inputRef.current.innerHTML)

    // set the new message
    setMessage({ html: inputRef.current.innerHTML });
  }, [pressedEmoji])

  const handleChange = (e) => {
    if (e.target.value !== "<div><br></div>" && e.target.value.indexOf("<div>") !== 0) {
      // wrap the first text in a div
      e.target.value = e.target.value.split("<div>").map((word, wordIndex) => {
        console.log("word, wordIndex", word, wordIndex)
        if (wordIndex === 0) {
          return "<div>" + word + "</div>";
        } else {
          if (!word.includes("</div>")) {
            return "<div>" + word + "</div>";
          } else {
            return "<div>" + word;
          }
        }
      });
    }
    // console.log("1", e.target.value)
    // check if all the text is incapsulated in a div, if so remove it
    if (e.target.value.indexOf("<div>") === 0 && e.target.value.lastIndexOf("</div>") === e.target.value.length - 6) {
      e.target.value = e.target.value.substring(5, e.target.value.length - 6);
    }
    // console.log("2", e.target.value, e.target.value[e.target.value.length - 1])
    // remove last div if is empy
    if (typeof e.target.value !== "string") {
      e.target.value = e.target.value[e.target.value.length - 1] === "<div></div>" ? "" : e.target.value;
    }
    // console.log("3", e.target.value)
    if (typeof e.target.value !== "string" && e.target.value) e.target.value = e.target.value.join("");
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
            innerRef={inputRef}
          />
        <div className="messageBoxButtons">
          <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatControls