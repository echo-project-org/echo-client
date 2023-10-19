import "../../css/chatinput.css";

import { useState, useEffect, useRef, createElement } from 'react'
import { Emoji, EmojiStyle } from "emoji-picker-react";

import MessageBoxButtons from './MessageBoxButtons';
import UploadBoxButtons from './UploadBoxButtons';
import ChatBox from './ChatBox.ts';

import { ep, storage, ap } from "../../index";

const api = require("../../api");

function ChatControls({ onEmojiOn, roomId }) {
  const [message, setMessage] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [pressedEmoji, setPressedEmoji] = useState({});
  const inputRef = useRef(null);

  const sendChatMessage = (e) => {
    console.log("about to send this message", message.text, message.html)
    if (!message.text) return;
    if (message.text === "\n") return;
    if (message.text.length === 0) return;
    ep.sendChatMessage({ roomId, userId: storage.get("id"), message, self: true, date: new Date().toISOString() });
    setMessage("");
    setMessageHtml("");
  }

  useEffect(() => {
    ep.on("receiveChatMessage", "ChatControls.receiveChatMessage", (data) => {
      if (String(data.userId) === storage.get("id")) {
        ap.playNewSelfMessageSound();
        data.userId = Number(data.id);
        console.log("ChatControls.receiveChatMessage", data)
        // make api call after the server received it
        api.call("rooms/messages", "POST", data).then((res) => { }).catch((err) => { console.log(err); });
      } else {
        ap.playNewMessageSound();
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
    // const r = s.getRangeAt(0);
    if (!s.focusNode.parentElement.classList.contains("chatboxContent")) return

    // console.log("s before", s)
    // console.log('sfo:', s.focusOffset, 'sao:', s.anchorOffset, 'rso:', r.startOffset, 'reo:', r.endOffset, '»' + s.toString());
    console.log(s)

    // maybe useless, but anyway...
    if (s.focusNode && s.focusNode.id === "chatInputText") {
      // add a div to the selection
      // s.focusNode.innerHTML = "<div><br></div>";
      return
    };
    var node = s.focusNode.textContent;
    const cursorPosition = s.focusOffset;
    let textBeforeCursorPosition = node.substring(0, cursorPosition)
    let textAfterCursorPosition = node.substring(cursorPosition, node.length)
    s.focusNode.textContent = textBeforeCursorPosition + emojiFormat + textAfterCursorPosition;
    setMessage(s.focusNode.textContent);

    const splittedRef = inputRef.current.innerHTML.split(emojiFormat);
    const newRef = splittedRef[0] + `&nbsp;<img src="${pressedEmoji.getImageUrl("twitter")}" draggable="false" alt="${pressedEmoji.emoji}" class="emoji" />&nbsp;` + splittedRef[1];
    inputRef.current.innerHTML = newRef;

    // set the new message
    setMessageHtml(inputRef.current.innerHTML);
  }, [pressedEmoji])

  const handleChange = (e) => {
    // console.warn("handleChange", e.target.value, e.target.value.indexOf("<div>"))
    if (e.target.value !== `<div class="chatboxContent"><br></div>` && e.target.value.indexOf(`<div class="chatboxContent">`) !== 0) {
      // wrap the first text in a div
      // console.log("------------ target ---------------");
      e.target.value = e.target.value.split(`<div class="chatboxContent">`).map((word, wordIndex) => {
        // console.log("word, wordIndex", word, wordIndex)
        // wrap all lines in a div and a span
        return `<div class="chatboxContent">${word}</div>`;
      });
      // check if all the text is incapsulated in a div, if so remove it
      if (e.target.value.indexOf(`<div class="chatboxContent">`) === 0 && e.target.value.lastIndexOf("</div>") === e.target.value.length - 6) {
        e.target.value = e.target.value.substring(5, e.target.value.length - 6);
      }
      // remove last div if is empy
      if (typeof e.target.value !== "string") {
        e.target.value = e.target.value[e.target.value.length - 1] === `<div class="chatboxContent"></div>` ? "" : e.target.value;
      }
      if (typeof e.target.value !== "string" && e.target.value) e.target.value = e.target.value.join("");
    }
    setMessageHtml(e.target.value);
  }

  useEffect(() => {
    console.warn(message);
    console.warn(messageHtml);
  }, [message, messageHtml])

  return (
    <div className='chatControls'>
      <div className='chatInputContainer'>
        <div className="messageBoxButtons">
          <UploadBoxButtons onClick={() => { console.log("click upload") }} />
        </div>
        <div
          className='chatInputText'
          id='chatInputText'
        >
          <ChatBox
            html={messageHtml} // innerHTML of the editable div
            disabled={false} // use true to disable edition
            onChange={handleChange} // handle innerHTML change
            spellCheck={false}
            suppressContentEditableWarning={true}
            innerRef={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
              }
            }}
          >
            {/* <span></span> */}
          </ChatBox>
        </div>
        <div className="messageBoxButtons">
          <MessageBoxButtons onEmojiOn={onEmojiOn} onClick={sendChatMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatControls