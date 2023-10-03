import "../../css/screenshare.css";

import React from 'react'
import { useState, useEffect } from 'react'
import { Avatar, Container, Grid, Typography, styled } from '@mui/material'
import ScreenShareControlIcons from './ScreenShareControlIcons';

import { ep } from '../..';

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

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    overflow: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    height: "100%",
    width: "100%",
    position: "absolute",
    maxWidth: "calc(100vw - 20rem)",
    padding: "0",
  },
}));

function RoomContentScreenShares({ roomId }) {
  const [users, setUsers] = useState([]);
  const [focusedUser, setFocusedUser] = useState(null);
  // const [screenShareStream, setScreenShareStream] = useState("");

  useEffect(() => {
    const users = ep.getUsersInRoom(roomId)
    console.log("users", users)
    setUsers(users)
  }, [roomId])

  useEffect(() => {
    ep.on("gotVideoStream", (data) => {
      setFocusedUser(data.user);
      var myDiv = document.getElementById('screenShareContainer');
      // myDiv.innerHTML = variableLongText;
      myDiv.scrollTop = (99999999999999 * -1);
    })
  }, [])

  const selectUser = (user) => {
    console.log("selectUser", user);
    ep.startReceivingVideo(user.id);
  }
  const stopPlayback = () => {
    setFocusedUser(null);
  }
  const computeFocusedUser = () => {
    if (focusedUser) {
      return (
        <Grid item xs={12}>
          <ScreenShareControlIcons stopPlayback={stopPlayback} />
        </Grid>
      )
    }
  }

  return (
    <StyledContainer id="screenShareContainer">
      <Grid container gap={3} className="screenshareUserGridContainer noselect">
        {computeFocusedUser()}
        {
          users.map((user) => {
            return (
              <Grid item className="screenshareUserContainer" key={user.id} onMouseDown={() => { selectUser(user); }}>
                <Container className="screenshareUser" sx={{ background: (user.userImage ? `url(${user.userImage})` : "white") }}></Container>
                <StyledAvatar className="screenshareUserAvatar" src={user.userImage} />
                <StyledTypography variant="h4">{user.name}</StyledTypography>
              </Grid>
            )
          })
        }
      </Grid>
    </StyledContainer>
  )
}

export default RoomContentScreenShares