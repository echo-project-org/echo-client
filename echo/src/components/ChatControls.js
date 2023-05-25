import React from 'react'
import { createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@emotion/react';
import MessageBoxButtons from './MessageBoxButtons';

function ChatControls() {
    const theme = createTheme({
        palette: {
            primary: { main: '#f5e8da', },
            secondary: { main: '#ce8ca5', },
        },
    });

    return (
        <div className='chatControls'>
            <ThemeProvider theme={theme}>
                <form className='chatForm' noValidate autoComplete="off">
                    <TextField
                        sx={{
                            input:{
                                color: '#f5e8da',
                            }}}
                        id="messageBox"
                        multiline
                        fullWidth
                        rows={2}
                        label="Send a message."
                        InputProps={{
                            endAdornment: <MessageBoxButtons />,
                        }}
                    />

                </form>
            </ThemeProvider>
        </div>
    )
}

export default ChatControls