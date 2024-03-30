import "@css/emoji.css"

import EmojiPickerReact from "emoji-picker-react";
import { useState } from "react";
import { EmojiClickData, Emoji, EmojiStyle } from "emoji-picker-react";

import { ep } from "@root/index";

function EmojiPicker({ show }) {
  // const [emojiPicker, setEmojiPicker] = useState(false);
  // const [selectEmoji, setSelectEmoji] = useState("");

  // function for emoji selection
  function handleSelectEmoji(emojiData, event) {
    // setSelectEmoji(emojiData.unified);
    ep.emit("selectedEmoji", emojiData)
  }

  // function for showing the actual emoji
  // function ShowEmoji() {
  //   return <Emoji unified={selectEmoji} emojiStyle={EmojiStyle.TWITTER} />;
  // }

  if (!show) return (<></>);

  const style={
    position: "absolute",
    bottom: "5rem",
    right: "1rem",
    zIndex: "1000",
    opacity: show ? "1" : "0",
  }

  return (
    <div style={style}>
      <EmojiPickerReact onEmojiClick={handleSelectEmoji} emojiStyle="twitter" lazyLoadEmojis searchDisabled skinTonesDisabled />
    </div>
  );
}

export default EmojiPicker