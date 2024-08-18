import React, { useEffect } from 'react';
import { useState } from 'react';
import { ButtonGroup, Button, Tooltip, Container, ClickAwayListener, Grid, Slider } from '@mui/material';
import { CancelPresentation, VolumeUp, VolumeOff, PictureInPictureAlt } from '@mui/icons-material';
import ReactPlayer from 'react-player';
import { info } from '@lib/logger';
import { ee, ep } from '@root';

const VolumeSlider = ({ showVolumeSlider, hideVolumeSlider, volume, setVolume }) => {
  if (!showVolumeSlider) return (<></>)

  return (
    <Container sx={{
      position: "absolute",
      bottom: "3.8rem",
      left: "0",
      width: "100%",
      height: "200%",
      zIndex: "3",
      // opacity: showVolumeSlider ? "1" : "0",
      transition: "all 0.1s ease",
    }}>
      <ClickAwayListener onClickAway={hideVolumeSlider}>
        <Slider
          sx={{
            right: "2.5rem"
          }}
          orientation='vertical'
          value={volume}
          onChange={(e, newValue) => setVolume(newValue)}
        ></Slider>
      </ClickAwayListener>
    </Container>
  )
}

const ScreenShareControlIcons = ({ stopPlayback }) => {
  const [showControls, setShowControls] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(ep.getVideo());
  const [muted, setMuted] = useState(false);
  const [pip, setPip] = useState(false);
  const [volumeSlider, setVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(0);

  const handleMouseEnter = () => {
    setShowControls(true);
  }
  const handleMouseLeave = () => {
    // setShowControls(false);
  }
  const toggleMuteStream = () => {
    info("[ScreenShareControlIcons] Toggling mute")
    setMuted(!muted);
  }
  const stopWaching = () => {
    info("[ScreenShareControlIcons] Stopping watching")
    stopPlayback();
  }
  const enablePip = () => {
    info("[ScreenShareControlIcons] Enabling pip")
    setPip(true);
  }
  const disablePip = () => {
    info("[ScreenShareControlIcons] Disabling pip")
    setPip(false);
  }

  const showVolumeSlider = () => {
    info("[ScreenShareControlIcons] Showing volume slider")
    setVolumeSlider(true);
  }
  const hideVolumeSlider = () => {
    info("[ScreenShareControlIcons] Hiding volume slider")
    setVolumeSlider(false);
  }

  useEffect(() => {
    ee.on("gotVideoStream", (data) => {
      info("[ScreenShareControlIcons] Got video stream")
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
      aspectRatio: "1.78"
    }}>
      <ReactPlayer
        url={screenShareStream}
        playing={true}
        muted={muted}
        width={"100%"}
        height={"100%"}
        volume={volume/100}
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
        <Grid container direction='row' alignItems='center' justifyContent='center' paddingBottom={"1rem"} zIndex={3} sx={{
          // align items to bottom of container
          position: "absolute",
          bottom: ".1rem",
          left: "0",
          width: "100%",
        }}>
          <ButtonGroup variant='text'>
            <>
              <VolumeSlider volume={volume} setVolume={setVolume} showVolumeSlider={volumeSlider} hideVolumeSlider={hideVolumeSlider} />
              <Button disableRipple onClick={toggleMuteStream} onMouseEnter={showVolumeSlider}>
                {muted ? <VolumeOff /> : <VolumeUp />}
              </Button>
            </>
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