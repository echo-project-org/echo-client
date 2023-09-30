import "../../css/chatinput.css";

import { useState, useEffect, useRef } from 'react'
import MessageBoxButtons from './MessageBoxButtons';
import UploadBoxButtons from './UploadBoxButtons';
import { Emoji, EmojiStyle } from "emoji-picker-react";

import { ep, storage } from "../../index";

const api = require("../../api");

const newMessageSound = require("../../audio/newmessage.mp3");
const newSelfMessageSound = require("../../audio/newmessageself.mp3");

function ChatControls({ onEmojiOn, roomId }) {
  const [message, setMessage] = useState("");
  const [pressedEmoji, setPressedEmoji] = useState({});
  const [selectionPosition, setSelectionPosition] = useState(0);
  // const [focusedChatLine, setFocusedChatLine] = useState(0);
  // const [chatLines, setChatLines] = useState([{ position: 0, message: "" }]);
  const [prevKey, setPrevKey] = useState("");
  const inputRef = useRef(null);

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
    const newMessage = message + " \\" + pressedEmoji.unified + " ";
    setMessage(newMessage);
    setTimeout(() => {
      inputRef.current.focus();
      // Set the cursor position
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(inputRef.current, (selectionPosition + 1));
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }, 50)
  }, [pressedEmoji])

  const computeKeyPress = (e) => {
    console.log(e.key, "key")
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (prevKey === "Shift") {
          // setChatLines([...chatLines, { position: 0, message: message }]);
          // setFocusedChatLine(chatLines.length);
          setPrevKey("");
        } else {
          // sendChatMessage();
        }
        break;
      case "Backspace":
        e.preventDefault();
        console.log("backspace", message)
        if (message === "") break;
        if (message[message.length - 1] === " ") {
          setMessage(message.slice(0, -1));
          break;
        }
        break;
      case "Shift":
        e.preventDefault();
        break;
      case "Control":
        break;
      case "Alt":
        break;
      case "ArrowLeft":
        break;
      case "ArrowRight":
        break;
      case "ArrowUp":
        // if (focusedChatLine === 0) break;
        // var newFocusLine = focusedChatLine - 1;
        // setFocusedChatLine(newFocusLine);
        // document.getElementById("chatLine" + newFocusLine).focus();
        break;
      case "ArrowDown":
        // if (focusedChatLine === chatLines.length - 1) break;
        // var newFocusLine = focusedChatLine + 1;
        // setFocusedChatLine(newFocusLine);
        // document.getElementById("chatLine" + newFocusLine).focus();
        break;
      default:
        // chatLines[focusedChatLine].message += e.key;
        // chatLines[focusedChatLine].position += 1;
        // setChatLines([...chatLines]);
        setMessage(message + e.key)
        break;
    }
    if (e.key !== "Backspace") {
      setPrevKey(e.key);
    }
  }

  // check if the message contains and emoji in any place and replace it with the emoji
  const computeMessage = () => {
    let position = 0;
    return message.split(" ").map((word, wordIndex) => {
      if (word[0] === "\\") {
        return (
          <span
            className="inlineElement"
            contentEditable={false}
            key={wordIndex + word}
          >
            <Emoji unified={word.slice(1)} emojiStyle={EmojiStyle.TWITTER} />
          </span>
        );
      } else {
        position += word.length + 1;
        return (
          <span
            contentEditable={false}
            key={wordIndex + word}
            ref={inputRef}
            onBlur={() => setSelectionPosition(position)}
            onFocus={() => setSelectionPosition(position)}
          >
            {word + " "}
          </span>
        );
      }
    })
  }

  return (
    <div className='chatControls'>
      <div className='chatInputContainer'>
        <div className="messageBoxButtons">
          <UploadBoxButtons onClick={() => { console.log("click upload") }} />
        </div>
        <div className='chatInputText' id='chatInputText'>
          <div
            id="message"
            className="message"
            onKeyDown={computeKeyPress}
            contentEditable={true}
            spellCheck={false}
            suppressContentEditableWarning={true}
          >
            <div></div>
            {computeMessage()}
          </div>
        </div>
        <div className="messageBoxButtons">
          <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatControls