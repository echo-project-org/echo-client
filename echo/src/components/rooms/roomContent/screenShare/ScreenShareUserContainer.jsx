import React, { useEffect, useState } from 'react'
import { Container, Grid } from '@mui/material'
import { Visibility } from '@mui/icons-material';
import { info } from '@lib/logger';
import { ee, ap } from '@root';

import StylingComponents from '@root/StylingComponents';

function ScreenShareUserContainer({ user, selectUser }) {
  const [broadcastingVideo, setBroadcastingVideo] = useState(user.broadcastingVideo);
  const [talking, setTalking] = useState(user.talking);

  useEffect(() => {
    ee.on("videoBroadcastStarted", "ScreenShareUserContainer.videoBroadcastStarted", (data) => {
      if (data.id === user.id) {
        setBroadcastingVideo(true);
        if (!data.silent) {
          ap.playStartStreamSound();
        }
      }
    });

    ee.on("videoBroadcastStop", "ScreenShareUserContainer.videoBroadcastStop", (data) => {
      if (data.id === user.id) {
        setBroadcastingVideo(false);
        ap.playEndStreamSound();
      }
    });

    ee.on("audioStatsUpdate", "ScreenShareUserContainer.audioStatsUpdate", (audioData) => {
      if (audioData.id === user.id) {
        setTalking(audioData.talking);
      }
    });

    return () => {
      ee.releaseGroup("ScreenShareUserContainer.videoBroadcastStarted");
      ee.releaseGroup("ScreenShareUserContainer.videoBroadcastStop");
      ee.releaseGroup("ScreenShareUserContainer.audioStatsUpdate");
    }
  }, [user]);

  if (broadcastingVideo) {
    return (
      <Grid item className={talking ? "talking screenshareUserContainer" : "screenshareUserContainer"} key={user.id} onMouseDown={() => { selectUser(user); }}>
        <Container className="screenshareUser" sx={{ background: "rgba(140, 40, 40, 1)" }}></Container>
        <StylingComponents.ScreenShare.StyledScreenShareUserButton
          onClick={() => { selectUser(user); }}
          size='large'
        ><Visibility /> Watch stream</StylingComponents.ScreenShare.StyledScreenShareUserButton>
        <StylingComponents.ScreenShare.StyledScreenShareTypography variant="h4">{user.name}</StylingComponents.ScreenShare.StyledScreenShareTypography>
      </Grid>
    );
  } else {
    return (
      <Grid item className={talking ? "talking screenshareUserContainer" : "screenshareUserContainer"} key={user.id}>
        <Container className="screenshareUser" sx={{ background: (user.userImage ? `url(${user.userImage})` : "white") }}></Container>
        <StylingComponents.ScreenShare.StyledScreenShareAvatar className="screenshareUserAvatar" src={user.userImage} />
        <StylingComponents.ScreenShare.StyledScreenShareTypography variant="h4">{user.name}</StylingComponents.ScreenShare.StyledScreenShareTypography>
      </Grid>
    );
  }
}

export default ScreenShareUserContainer