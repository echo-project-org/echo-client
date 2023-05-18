import React from 'react'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

const theme = createTheme({
    palette: {
      primary: {main: '#f5e8da',},
      secondary: {main: '#ce8ca5',},
    },
});

function CloseButton({className}) {
  return (
    <div className={className}>
        <ThemeProvider theme={theme}>
            <Button>
                <CloseIcon/>
            </Button>
        </ThemeProvider>
    </div>
  )
}

export default CloseButton