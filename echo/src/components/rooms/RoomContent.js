import "../../css/chat.css";

import { useState, useEffect } from 'react'
import { Grid, Container, styled, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ChatBubble, PeopleAlt, Window } from '@mui/icons-material';

import RoomContentChat from "./RoomContentChat";
import RoomContentScreenShares from "./RoomContentScreenShares";
import RoomContentFriends from "./RoomContentFriends";

import { ep } from "../../index";

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    margin: "0 0 0 1rem",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: theme.palette.background.dark,
    padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "10%",
  },
  [theme.breakpoints.up('lg')]: {
    margin: "0 0 0 1rem",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: theme.palette.background.dark,
    padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "10%",
  },
  [theme.breakpoints.up('xl')]: {
    margin: "0 0 0 1rem",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: theme.palette.background.dark,
    padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "10%",
  },
}));

const StyledContainerContent = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    margin: ".1rem 0 0 1rem",
    height: "100%",
    width: "100%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: theme.palette.background.dark,
  },
}));

function RoomContent({ roomId }) {
  // const [hasUsersStreaming, setHasUsersStreaming] = useState(false);
  const [contentSelected, setContentSelected] = useState("friends");
  const [roomName, setRoomName] = useState("Join a room"); // MAX 20 CHARS
  const [roomDescription, setRoomDescription] = useState("This room has no description or you are not in a room"); // MAX 150 CHARS

  const handleChange = (event, newAlignment) => {
    if (newAlignment === null) return;
    setContentSelected(newAlignment);
  };
  const control = {
    value: contentSelected,
    onChange: handleChange,
    exclusive: true,
  };
  const computeRoomContent = () => {
    switch (contentSelected) {
      case "chat":
        return <RoomContentChat roomId={roomId} key={0} />
      case "screen":
        return <RoomContentScreenShares roomId={roomId} key={1} />
      case "friends":
        return <RoomContentFriends key={2} />
      default:
        return <RoomContentChat roomId={roomId} key={0} />
    }
  }
  useEffect(() => {
    const roomData = ep.getRoom(roomId);
    if (roomData) {
      setRoomName(roomData.name);
      setRoomDescription(roomData.description);
    }
  }, [roomId]);

  useEffect(() => {
    ep.on("gotVideoStream", (data) => {
      setContentSelected("screen");
    })

    ep.on("exitedFromRoom", (data) => {
      setContentSelected("friends");
    })
  }, [contentSelected]);

  const computeButtons = () => {
    if (String(roomId) === "0") {
      // setContentSelected("friends");
      return [
        <ToggleButton value="friends" key="friends" disableRipple>
          <PeopleAlt />
        </ToggleButton>
      ]
    } else {
      return [
        <ToggleButton value="friends" key="friends" disableRipple>
          <PeopleAlt />
        </ToggleButton>,
        <ToggleButton value="chat" key="chat" disableRipple>
          <ChatBubble />
        </ToggleButton>,
        <ToggleButton value="screen" key="screen" disableRipple>
          <Window />
        </ToggleButton>,
      ]
    }
  }

  return (
    <Grid container direction={"row"}>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{
        maxHeight: "43.09px",
      }}>
        <StyledContainer>
          <Grid container>
            <Grid item xs={11} sm={11} md={10} lg={10} xl={10} sx={{
              display: "flex",
              flexDirection: "row",
            }} >
              <Container className="roomTitleContainer">
                {roomName}
              </Container>
              <Divider orientation="vertical" sx={{ backgroundColor: "#2e2030" }} />
              <Container className="roomDescriptionContainer">
                {roomDescription}
              </Container>
            </Grid>
            <Grid item xs={1} sm={1} md={2} lg={2} xl={2} sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}>
              <ToggleButtonGroup size="small" {...control} aria-label="Small sizes">
                {computeButtons()}
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </StyledContainer>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{
        height: "calc(100vh - 5rem)",
        maxHeight: "calc(100vh - 5rem)",
      }}>
        <StyledContainerContent>
          {computeRoomContent()}
        </StyledContainerContent>
      </Grid>
    </Grid>
  )
}

export default RoomContent