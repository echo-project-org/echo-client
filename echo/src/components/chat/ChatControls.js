import React from 'react'
import { createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@emotion/react';
import { styled } from "@mui/material/styles";
import MessageBoxButtons from './MessageBoxButtons';

const StyledTextField = styled(TextField)({
    "& label": {
        color: "#f5e8da",
    },
    "& label.Mui-focused": {
        color: "#f5e8da",
    },
    "& .MuiInput-underline:after": {
        borderBottomColor: "#f5e8da",
    },
    "& .MuiInputBase-root": {
        color: "#f5e8da",
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "#f5e8da",
        },
        "&:hover fieldset": {
            borderColor: "#f5e8da",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#f5e8da",

        }
    }
});

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
    typography: {
        fontFamily: ['Roboto Condensed'].join(','),
    },
});

function ChatControls() {
    return (
        <div className='chatControls'>
            <ThemeProvider theme={theme}>
                <form className='chatForm' noValidate autoComplete="off">
                    <StyledTextField
                        id="messageBox"
                        autoFocus
                        onKeyDown = {(e) => {
                            // check if enter is pressed
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                console.log('Enter key pressed, Send message.');
                            }
                        }}
                        fullWidth
                        multiline
                        maxRows={2}
                        label="Send a message."
                        InputProps={{
                            endAdornment: <MessageBoxButtons />,
                            style: {color: "#f5e8da"}
                        }}
                    />

                </form>
            </ThemeProvider>
        </div>
    )
}

export default ChatControls