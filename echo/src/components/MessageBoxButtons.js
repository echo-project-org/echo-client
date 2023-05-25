import React from 'react'
import { Button, ButtonGroup, InputAdornment } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';

function MessageBoxButtons() {
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
                    <Button >
                        <EmojiEmotionsIcon />
                    </Button>
                    <Button >
                        <SendIcon />
                    </Button>
                </ButtonGroup>
            </ThemeProvider>
        </InputAdornment>
  )
}

export default MessageBoxButtons