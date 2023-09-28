import React from 'react';
import { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import { CancelPresentation, VolumeUp, VolumeOff } from '@mui/icons-material';

const ScreenShareControlIcons = ({ muted, toggleMuteStream }) => {
  const [showControls, setShowControls] = useState(false);

  const handleMouseEnter = () => {
    setShowControls(true);
  }

  const handleMouseLeave = () => {
    setShowControls(false);
  }

  const stopWaching = () => {
    console.log("Stop watching")
  }

  const controlsDivStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    opacity: showControls ? 1 : 0,
    transition: 'opacity 0.3s ease',
  }

  return (
    <div style={controlsDivStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Grid container direction='row' alignContent='center' justifyContent='start' style={{ padding: 16 }}>
        <Grid item>
          <Typography variant='h5' style={{ color: '#f5e8da' }}>Player</Typography>
        </Grid>

      </Grid>
      <Grid container direction='row' alignItems='center' justifyContent='center' paddingBottom={"1rem"}>
        <ButtonGroup variant='text' className='buttonGroup'>
          <Tooltip title={"Mute stream"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Button disableRipple onClick={toggleMuteStream}>
              {muted ? <VolumeOff /> : <VolumeUp />}
            </Button>
          </Tooltip>
          <Tooltip title={"Stop watching"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Button disableRipple onClick={stopWaching}>
              <CancelPresentation />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
    </div>
  )
}

export default ScreenShareControlIcons;