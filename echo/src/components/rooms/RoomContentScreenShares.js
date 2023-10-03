import "../../css/screenshare.css";

import React from 'react'
import { useState, useEffect } from 'react'
import { Container, Grid, styled } from '@mui/material'
import ScreenShareControlIcons from './ScreenShareControlIcons';
import ScreenShareUserContainer from "./ScreenShareUserContainer";

import { ep } from '../..';

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
    ep.stopReceivingVideo(focusedUser.id);
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
              <ScreenShareUserContainer key={user.id} user={user} selectUser={selectUser} />
            )
          })
        }
      </Grid>
    </StyledContainer>
  )
}

export default RoomContentScreenShares