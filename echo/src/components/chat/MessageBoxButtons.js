import React from 'react'
import { Button, ButtonGroup, InputAdornment } from '@mui/material'
import { Send, EmojiEmotions } from '@mui/icons-material';

function MessageBoxButtons({ onEmojiOn, onClick }) {
  return (
    <InputAdornment position="end">
      <ButtonGroup variant='text'>
        <Button onClick={onEmojiOn}>
          <EmojiEmotions />
        </Button>
        <Button >
          <Send onClick={onClick} />
        </Button>
      </ButtonGroup>
    </InputAdornment>
  )
}

export default MessageBoxButtons