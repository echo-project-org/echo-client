import "../../css/friends.css";

import { useEffect, useState } from "react";

import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call } from "@mui/icons-material";

function RoomContentFriends({ }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    setFriends([
      {
        id: "1",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/150",
      },
      {
        id: "2",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/120",
      },
      {
        id: "3",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      },
      {
        id: "4",
        name: "John Doe",
        online: "1",
        userImage: "https://via.placeholder.com/110",
      }
    ])
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