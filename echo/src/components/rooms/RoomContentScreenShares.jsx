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

const FocusedUser = ({ stopPlayback, focusedUser }) => {
  if (focusedUser === 'undefined') return null;
  return (
    <Grid item xs={12}>
      <ScreenShareControlIcons stopPlayback={stopPlayback} />
    </Grid>
  )
}

function RoomContentScreenShares({ roomId }) {
  const [users, setUsers] = useState([]);
  const [focusedUser, setFocusedUser] = useState('undefined');
  // const [screenShareStream, setScreenShareStream] = useState("");

  useEffect(() => {
    const users = ep.getUsersInRoom(roomId)
    setUsers(users)
  }, [roomId])

  useEffect(() => {
    ep.on("gotVideoStream", (data) => {
      setFocusedUser(data.user.id);
      var myDiv = document.getElementById('screenShareContainer');
      // myDiv.innerHTML = variableLongText;
      if(myDiv){
        myDiv.scrollTop = (99999999999999 * -1);
      }
    })

    ep.on("videoBroadcastStop", "OnlineUserIcon.videoBroadcastStop", (data) => {
      if (data.id === focusedUser) {
        setFocusedUser('undefined');
      }
    });
  }, [focusedUser])

  useEffect(() => {
    const updateUsers = () => {
      setUsers(ep.getUsersInRoom(roomId));
    }
    ep.on("userJoinedChannel", "RoomContentScreenShares.userJoinedChannel", (data) => {
      if (data.roomId === roomId) {
        updateUsers();
      }
    })

    ep.on("userLeftChannel", "RoomContentScreenShares.userLeftChannel", (data) => {
      if (data.roomId === roomId) {
        updateUsers();
      }
    })
  }, [users])

  const selectUser = (user) => {
    if(focusedUser === user.id){
      return;
    }
    ep.startReceivingVideo(user.id);
  }
  const stopPlayback = () => {
    ep.stopReceivingVideo(focusedUser.id);
    setFocusedUser('undefined');
  }

  return (
    <StyledContainer id="screenShareContainer">
      <Grid container gap={3} className="screenshareUserGridContainer noselect">
        <FocusedUser stopPlayback={stopPlayback} focusedUser={focusedUser} />
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