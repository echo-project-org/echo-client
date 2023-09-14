import React from 'react'
import { Button, ButtonGroup, InputAdornment } from '@mui/material'
import { Send, EmojiEmotions } from '@mui/icons-material';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';

function MessageBoxButtons({ onEmojiOn, onClick }) {
  const theme = createTheme({
    palette: {
      primary: { main: '#f5e8da', },
      secondary: { main: '#ce8ca5', },
    },
  });

  return (
    <InputAdornment position="end">
      <ThemeProvider theme={theme}>
        <ButtonGroup variant='text'>
          <Button onClick={onEmojiOn}>
            <EmojiEmotions />
          </Button>
          <Button >
            <Send onClick={onClick} />
          </Button>
        </ButtonGroup>
      </ThemeProvider>
    </InputAdornment>
  )
}

export default MessageBoxButtons