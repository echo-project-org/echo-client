import React from 'react'
import { Button, ButtonGroup, InputAdornment } from '@mui/material'
import { Send, EmojiEmotions } from '@mui/icons-material';
import { useTheme } from '@emotion/react';

function MessageBoxButtons({ onEmojiOn, onClick }) {
  const theme = useTheme();
  const buttonStyle = {
    color: theme.palette.text.main,
    backgroundColor: theme.palette.background.dark,
    textAlign: "center",
  }

  return (
    <InputAdornment position="end">
      <ButtonGroup variant='text'>
        <Button onClick={onEmojiOn} sx={buttonStyle}>
          <EmojiEmotions />
        </Button>
        <Button sx={buttonStyle} onClick={onClick} >
          <Send />
        </Button>
      </ButtonGroup>
    </InputAdornment>
  )
}

export default MessageBoxButtons