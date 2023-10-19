import "../../css/chat.css";

import { useState, useEffect } from 'react'
import { Grid, Container, styled, Divider } from '@mui/material';
import InternalRoomContent from "./InternalRoomContent.jsx";

import { ep, storage } from "../../index";
import RoomContentSelector from "./RoomContentSelector.jsx";

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

  useEffect(() => {
    const roomData = ep.getRoom(roomId);
    if (roomData) {
      setRoomName(roomData.name);
      setRoomDescription(roomData.description);
    }
  }, [roomId]);

  const setContentSelectedWrap = (content) => {
    storage.set("lastContentSelected", content);
    setContentSelected(content);
  }

  useEffect(() => {
    ep.on("gotVideoStream", "RoomContent.gotVideoStream", (data) => {
      setContentSelected("screen");
    })

    ep.on("exitedFromRoom", "RoomContent.exitedFromRoom", (data) => {
      setContentSelected("friends");
    });

    ep.on("joinedRoom", "RoomContent.joinedRoom", (data) => {
      setContentSelectedWrap(storage.get("lastContentSelected") || "chat");
    });

    return () => {
      ep.releaseGroup("RoomContent.gotVideoStream");
      ep.releaseGroup("RoomContent.exitedFromRoom");
      ep.releaseGroup("RoomContent.joinedRoom");
    }
  }, [contentSelected]);

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
              <RoomContentSelector roomId={roomId} contentSelected={contentSelected} setContentSelected={setContentSelectedWrap} />
            </Grid>
          </Grid>
        </StyledContainer>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{
        height: "calc(100vh - 5rem)",
        maxHeight: "calc(100vh - 5rem)",
      }}>
        <StyledContainerContent>
          <InternalRoomContent roomId={roomId} contentSelected={contentSelected} />
        </StyledContainerContent>
      </Grid>
    </Grid>
  )
}

export default RoomContent