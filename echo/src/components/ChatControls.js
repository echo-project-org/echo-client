import React from 'react'
import { createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@emotion/react';
import { styled } from "@mui/material/styles";
import MessageBoxButtons from './MessageBoxButtons';

const StyledTextField = styled(TextField)({
    "& label": {
        color: "#f5e8da"
    },
    "& label.Mui-focused": {
        color: "#f5e8da"
    },
    "& .MuiInput-underline:after": {
        borderBottomColor: "#f5e8da"
    },
    "& .css-15zxrnv-MuiInputBase-root-MuiOutlinedInput-root ": {
        color: "#f5e8da"
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "#f5e8da"
        },
        "&:hover fieldset": {
            borderColor: "#f5e8da"
        },
        "&.Mui-focused fieldset": {
            borderColor: "#f5e8da"
        }
    }
});

function ChatControls() {
    const theme = createTheme({
        palette: {
            primary: { main: '#f5e8da', },
            secondary: { main: '#ce8ca5', },
        }
    });

    return (
        <div className='chatControls'>
            <ThemeProvider theme={theme}>
                <form className='chatForm' noValidate autoComplete="off">
                    <StyledTextField
                        id="messageBox"
                        fullWidth
                        multiline
                        maxRows={2}
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