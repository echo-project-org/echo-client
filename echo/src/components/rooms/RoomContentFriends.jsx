import "../../css/friends.css";

import { useEffect, useState } from "react";

import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call } from "@mui/icons-material";

import { ep, storage } from "../../index";

function RoomContentFriends({ }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    setFriends(ep.getUsersInRoom(1))
  }, []);

  return (
    <Container className="friends-list-container">
      <Container className="friends-list-overflow">
        {
          friends.map((user, index) => {
            return (
              <Grid container className="friend-container" key={index} flexDirection={"row"} display={"flex"}>
                <Grid item xs={3}>
                  <Avatar className="userAvatar" alt={user.id} src={user.userImage} />
                </Grid>
                <Grid item xs={3} className="userInfo">
                  <span className="userName">{user.name}</span>
                  <span className="userStatus">{user.online}</span>
                </Grid>
                <Grid item xs={8}>
                  <Container className="buttonsContainer">
                    <Button>
                      <ChatBubble />
                    </Button>
                    <Button>
                      <Call />
                    </Button>
                  </Container>
                </Grid>
              </Grid>
            )
          })
        }
      </Container>
    </Container>
  )
}

export default RoomContentFriends