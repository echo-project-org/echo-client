import React, { useEffect } from 'react';
import { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { ButtonGroup, Button, Tooltip, Container } from '@mui/material';
import { CancelPresentation, VolumeUp, VolumeOff, PictureInPictureAlt } from '@mui/icons-material';
import ReactPlayer from 'react-player';

import { ep } from '../..';

const ScreenShareControlIcons = ({ stopPlayback }) => {
  const [showControls, setShowControls] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(ep.getVideo());
  const [muted, setMuted] = useState(true);
  const [pip, setPip] = useState(false);

  const handleMouseEnter = () => {
    setShowControls(true);
  }
  const handleMouseLeave = () => {
    setShowControls(false);
  }
  const toggleMuteStream = () => {
    setMuted(!muted);
  }
  const stopWaching = () => {
    stopPlayback();
  }
  const enablePip = () => {
    setPip(true);
  }
  const disablePip = () => {
    setPip(false);
  }

  useEffect(() => {
    ep.on("gotVideoStream", (data) => {
      if (data.active) {
        setScreenShareStream(ep.getVideo());
      }
    })
  }, [screenShareStream])

  return (
    <Container id="wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{
      margin: "auto",
      position: "relative",
      width: "100%",
      height: "100%",
    }}>
      <ReactPlayer
        url={screenShareStream}
        playing={true}
        muted={muted}
        width="100%"
        height="100%"
        pip={pip}
        onDisablePIP={disablePip}
        config={{
          youtube: {
            playerVars: {
              width: "2000px",
              height: "2000px",
            }
          }
        }}
      />
      <Container sx={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)",
        transition: "all 0.1s ease",
        zIndex: "2",
        opacity: showControls ? "1" : "0",
      }}>
        <Grid container direction='row' alignContent='center' justifyContent='start' style={{ padding: 16 }}>
          <Grid item>
            <Typography variant='h5' style={{ color: '#f5e8da' }}>Player</Typography>
          </Grid>
        </Grid>

        <Grid container direction='row' alignItems='center' justifyContent='center' paddingBottom={"1rem"} zIndex={3} sx={{
          // align items to bottom of container
          position: "absolute",
          bottom: ".1rem",
          left: "0",
          width: "100%",
        }}>
          <ButtonGroup variant='text'>
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
            <Tooltip title={"Picture in picture"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
              <Button disableRipple onClick={enablePip}>
                <PictureInPictureAlt />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Grid>
      </Container>
    </Container>
  )
}

export default ScreenShareControlIcons;