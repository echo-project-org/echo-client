import "../../css/chat.css";

import { useState, useEffect } from 'react'
import { Grid, Container, styled, Divider } from '@mui/material';
import { ChatBubble, PeopleAlt } from '@mui/icons-material';

import RoomContentChat from "./RoomContentChat";
import RoomContentScreenShares from "./RoomContentScreenShares";

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    margin: "0 0 0 1rem",
    height: "90%",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: "#3e2542"
  },
  [theme.breakpoints.up('lg')]: {
    margin: "0 0 0 1rem",
    height: "90%",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: "#3e2542"
  },
  [theme.breakpoints.up('xl')]: {
    margin: "0 0 0 1rem",
    height: "90%",
    width: "100%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: "#3e2542"
  },
}));

function RoomContent({ roomId }) {
  const [hasUsersStreaming, setHasUsersStreaming] = useState(false);
  const [contentSelected, setContentSelected] = useState("chat");

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

  return (
    <Grid container>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <StyledContainer>
          <Grid container>
            <Grid item xs={10} sm={10} md={10} lg={10} xl={10} sx={{
              display: "flex",
              flexDirection: "row",
            }} >
              <Container className="roomTitleContainer">
                Room name
              </Container>
              <Divider orientation="vertical" sx={{ backgroundColor: "#2e2030" }} />
              <Container className="roomDescriptionContainer">
                Room description Room description Room description Room description Room description Room description Room description Room description Room description 
              </Container>
            </Grid>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
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