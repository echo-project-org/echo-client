import React from 'react'
import ReactPlayer from 'react-player';
import { useState, useEffect } from 'react'
import { Container, styled } from '@mui/material'
import ScreenShareControlIcons from './ScreenShareControlIcons';
import { ep } from '../..';


const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    margin: "0 0 0 1rem",
    height: "calc(100vh - 5rem)",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)"
  },
  [theme.breakpoints.up('lg')]: {
    margin: "0 0 0 1rem",
    height: "calc(100vh - 5rem)",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)"
  },
  [theme.breakpoints.up('xl')]: {
    margin: "0 0 0 1rem",
    height: "calc(100vh - 5rem)",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)"
  },
}));

const screenShareContainerStyle = {
  display: 'block',
  position: 'relative',
  width: '100%',
  top: "50%",
  transform: "translateY(-50%)"
}

const screenShareWrapperStyle = {
  backgroundColor: 'black',
  height: '100%',
}

function RoomContentScreenShares({ roomId }) {
  const [muted, setMuted] = useState(true);
  // const [screenShareStream, setScreenShareStream] = useState(`http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4`);
  const [screenShareStream, setScreenShareStream] = useState("");

  const toggleMuteStream = () => {
    setMuted(!muted);
    setScreenShareStream(ep.getVideo(1));
  }

  return (
    <StyledContainer>
      <div style={screenShareWrapperStyle}>
        <div style={screenShareContainerStyle}>
          <ReactPlayer
            url={screenShareStream}
            playing={true}
            muted={muted}
            width="100%"
            height="100%"
          />
          <ScreenShareControlIcons muted={muted} toggleMuteStream={toggleMuteStream} />
        </div>
      </div>
    </StyledContainer>
  )
}

export default RoomContentScreenShares