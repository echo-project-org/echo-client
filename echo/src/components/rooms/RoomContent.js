import "../../css/chat.css";

import { useState, useEffect } from 'react'
import { Grid, Container, styled, Divider } from '@mui/material';
import { ChatBubble, PeopleAlt } from '@mui/icons-material';

import RoomContentChat from "./RoomContentChat";
import RoomContentScreenShares from "./RoomContentScreenShares";

import { ep } from "../../index";

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    margin: "0 0 0 1rem",
    height: "90%",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: "#3e2542",
    padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "20%",
  },
  [theme.breakpoints.up('lg')]: {
    margin: "0 0 0 1rem",
    height: "90%",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: "#3e2542",
    padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "20%",
  },
  [theme.breakpoints.up('xl')]: {
    margin: "0 0 0 1rem",
    height: "90%",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: "#3e2542",
    padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "20%",
  },
}));

function RoomContent({ roomId }) {
  const [hasUsersStreaming, setHasUsersStreaming] = useState(false);
  const [contentSelected, setContentSelected] = useState("chat");
  const [roomName, setRoomName] = useState("Join a room"); // MAX 20 CHARS
  const [roomDescription, setRoomDescription] = useState("This room has no description or you are not in a room"); // MAX 150 CHARS

  const computeRoomContent = () => {
    switch (contentSelected) {
      case "chat":
        return <RoomContentChat roomId={roomId} />
      case "screen":
        return <RoomContentScreenShares roomId={roomId} />
      default:
        return <RoomContentChat roomId={roomId} />
    }
  }

  useEffect(() => {
    console.log("should be calling room data", roomId)
    const roomData = ep.getRoom(roomId);
    console.log("roomData", roomData)
    if (roomData) {
      console.log("im in roomData if statement")
      setRoomName(roomData.name);
      setRoomDescription(roomData.description);
    }
  }, [roomId]);

  return (
    <Grid container>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
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
            <Grid item xs={1} sm={1} md={2} lg={2} xl={2}>
              <Container className="iconsContainer">
                {
                  contentSelected === "chat" ?
                    <ChatBubble onClick={() => setContentSelected("chat")} sx={{ color: "#c895ff" }} />
                    :
                    <ChatBubble onClick={() => setContentSelected("chat")} />
                }
                {
                  contentSelected === "screen" ?
                    <PeopleAlt onClick={() => setContentSelected("screen")} sx={{ color: "#c895ff" }} />
                    :
                    <PeopleAlt onClick={() => setContentSelected("screen")} />
                }
              </Container>
            </Grid>
          </Grid>
        </StyledContainer>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        {computeRoomContent()}
      </Grid>
    </Grid>
  )
}

export default RoomContent