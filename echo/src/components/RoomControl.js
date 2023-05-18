import '../index.css'
import React from 'react'
import Button from '@mui/material/Button'
import { ButtonGroup } from '@mui/material'
import KeyboardVoiceRoundedIcon from '@mui/icons-material/KeyboardVoiceRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import { createTheme } from '@mui/material/styles';
import HeadsetOffRoundedIcon from '@mui/icons-material/HeadsetOffRounded';
import { ThemeProvider } from '@emotion/react';

const theme = createTheme({
    palette: {
      primary: {main: '#f5e8da',},
      secondary: {main: '#ce8ca5',},
    },
});

function RoomControl({muted, audioMuted}) {
  return (
    <div className='roomControl'>
        <ThemeProvider theme={theme}>
            <ButtonGroup variant='text'>
                <Button>
                    {!muted ? <KeyboardVoiceRoundedIcon/> : <MicOffRoundedIcon/>}
                </Button>
                <Button>
                    {!audioMuted ? <HeadsetMicRoundedIcon/> : <HeadsetOffRoundedIcon/>}
                </Button>
            </ButtonGroup>
        </ThemeProvider>
    </div>
    
    
  )
}

RoomControl.defaultProps = {
    muted: false,
    audioMuted: false
}

export default RoomControl