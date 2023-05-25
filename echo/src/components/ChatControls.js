import React from 'react'
import { createTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@emotion/react';
import { styled } from "@mui/material/styles";
import MessageBoxButtons from './MessageBoxButtons';
import RobotoCondensed from '../font/RobotoCondensed-Regular.ttf'

const StyledTextField = styled(TextField)({
    "& label": {
        color: "#f5e8da",
        fontFamily: 'RobotoCondensed',
    },
    "& label.Mui-focused": {
        color: "#f5e8da",
        fontFamily: 'RobotoCondensed',
    },
    "& .MuiInput-underline:after": {
        borderBottomColor: "#f5e8da",
        fontFamily: 'RobotoCondensed',
    },
    "& .css-15zxrnv-MuiInputBase-root-MuiOutlinedInput-root ": {
        color: "#f5e8da",
        fontFamily: 'RobotoCondensed',
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "#f5e8da",
            fontFamily: 'RobotoCondensed',
        },
        "&:hover fieldset": {
            borderColor: "#f5e8da",
            fontFamily: 'RobotoCondensed',
        },
        "&.Mui-focused fieldset": {
            borderColor: "#f5e8da",
            fontFamily: 'RobotoCondensed',
        }
    }
});

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
    typography: {
        fontFamily: 'RobotoCondensed',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        @font-face {
            font-family: 'RobotoCondensed';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: local('RobotoCondensed'), local('RobotoCondensed'), url(${RobotoCondensed}) format('ttf');
        }
        `,
        },
    },
});

function ChatControls() {
    return (
        <div className='chatControls'>
            <ThemeProvider theme={theme}>
                <form className='chatForm' noValidate autoComplete="off">
                    <StyledTextField
                        id="messageBox"
                        sx={{
                            fontFamily: 'RobotoCondensed',
                        }}
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