import "../../css/friends.css";

import { useEffect, useState } from "react";

import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call } from "@mui/icons-material";

import { ep, storage } from "../../index";
import CurrentStatus from "../user/CurrentStatus";

function RoomContentFriends({ }) {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [requested, setRequested] = useState([]);

  useEffect(() => {
    setFriends(ep.getUsersInRoom(1))

    ep.on("friendCacheUpdated", "RoomContentFriends.usersCacheUpdated", (_) => {
      setFriends(ep.getFriends());
      setPending(ep.getFriendRequested());
      setRequested(ep.getFriendRequests());
    });

    return () => {
      ep.releaseGroup("RoomContentFriends.usersCacheUpdated");
    }
  }, []);

  return (
    <Container className="friends-list-container">
      <Container className="friends-list-overflow">
        {
          friends.map((user, index) => {
            return (
              <Grid container className="friend-container" key={index} flexDirection={"row"} display={"flex"}>
                <Grid item xs={1}>
                  <Avatar className="userAvatar" alt={user.id} src={user.userImage} />
                </Grid>
                <Grid item xs={3} className="userInfo">
                  <span className="userName">{user.name}</span>
                  <CurrentStatus icon={false} align={"left"} height={"2rem"} />
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