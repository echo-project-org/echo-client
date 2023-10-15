import React, { useEffect, useState } from 'react'
import { Avatar, Container, Grid, Typography, styled, Badge } from '@mui/material'

import { ep } from '../..';

const startStreamSound = require("../../audio/streamstart.mp3");
const endStreamSound = require("../../audio/streamend.mp3");

const startStreamAudio = new Audio(startStreamSound);
startStreamAudio.volume = 0.6;
const endStreamAudio = new Audio(endStreamSound);
endStreamAudio.volume = 0.6;

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    // put image in the center of parent div
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "5rem",
    height: "5rem",
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.palette.text.main,
    opacity: "0.3",
  },
}));

function ScreenShareUserContainer({ user, selectUser }) {
  const [broadcastingVideo, setBroadcastingVideo] = useState(user.broadcastingVideo);
  const [talking, setTalking] = useState(user.talking);

  useEffect(() => {
    ep.on("videoBroadcastStarted", "ScreenShareUserContainer.videoBroadcastStarted", (data) => {
      if (data.id === user.id) {
        setBroadcastingVideo(true);
        startStreamAudio.play();
      }
    });

    ep.on("videoBroadcastStop", "ScreenShareUserContainer.videoBroadcastStop", (data) => {
      if (data.id === user.id) {
        setBroadcastingVideo(false);
        endStreamAudio.play();
      }
    });

    ep.on("audioStatsUpdate", "ScreenShareUserContainer.audioStatsUpdate", (audioData) => {
      console.log(audioData, user);
      if (audioData.id === user.id) {
        setTalking(audioData.talking);
      }
    });

    return () => {
      ep.off("videoBroadcastStarted", "ScreenShareUserContainer.videoBroadcastStarted");
      ep.off("videoBroadcastStop", "ScreenShareUserContainer.videoBroadcastStop");
      ep.off("audioStatsUpdate", "ScreenShareUserContainer.audioStatsUpdate");
    }
  }, [user]);

  if (broadcastingVideo) {
    return (
      <Grid item className={talking ? "talking screenshareUserContainer" : "screenshareUserContainer"} key={user.id} onMouseDown={() => { selectUser(user); }}>
        <Container className="screenshareUser" sx={{ background: "red" }}></Container>
        <StyledAvatar className="screenshareUserAvatar" src={user.userImage} />
        <StyledTypography variant="h4">{user.name}</StyledTypography>
      </Grid>
    );
  } else {
    return (
      <Grid item className={talking ? "talking screenshareUserContainer" : "screenshareUserContainer"} key={user.id}>
        <Container className="screenshareUser" sx={{ background: (user.userImage ? `url(${user.userImage})` : "white") }}></Container>
        <StyledAvatar className="screenshareUserAvatar" src={user.userImage} />
        <StyledTypography variant="h4">{user.name}</StyledTypography>
      </Grid>
    );
  }
}

export default ScreenShareUserContainer