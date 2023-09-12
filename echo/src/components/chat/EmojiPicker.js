import "../../css/emoji.css"

import EmojiPickerReact from "emoji-picker-react";
import { useState } from "react";
import { EmojiClickData, Emoji, EmojiStyle } from "emoji-picker-react";

function EmojiPicker({ show, style }) {
  // const [emojiPicker, setEmojiPicker] = useState(false);
  const [selectEmoji, setSelectEmoji] = useState("");

  // function for emoji selection
  function handleSelectEmoji(emojiData, event) {
    setSelectEmoji(emojiData.unified);
    console.log(selectEmoji, "this is the selected emoji");
    console.log(emojiData);
  }

  // function for showing the actual emoji
  function ShowEmoji() {
    return <Emoji unified={selectEmoji} emojiStyle={EmojiStyle.TWITTER} />;
  }

  if (!show) return (<></>);

  return (
    <div style={style}>
      <EmojiPickerReact onEmojiClick={handleSelectEmoji} emojiStyle="twitter" lazyLoadEmojis />
    </div>
  );
}

export default EmojiPicker