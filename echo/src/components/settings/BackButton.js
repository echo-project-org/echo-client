import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button'
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

const theme = createTheme({
    palette: {
        primary: { main: '#f5e8da', },
        secondary: { main: '#ce8ca5', },
    },
});

function BackButton() {
    const goBack = async () => {
        window.history.back();
    }

    return (
        <div className="backButton">
            <ThemeProvider theme={theme}>
                <Button onClick={goBack}>
                    <ArrowBackIcon fontSize="small" />
                </Button>
            </ThemeProvider>
        </div>
    )
}

export default BackButton