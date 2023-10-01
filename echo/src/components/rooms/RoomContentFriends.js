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
      }
    ])
  }, []);

  return (
    <>
      {
        friends.map((user, index) => {
          console.log(index);
          return (
            <Grid container key={index} flexDirection={"column"} display={"flex"}>
              <Grid item xs={12}>
                <Avatar alt={user.id} src={user.userImage} />
              </Grid>
              <Grid item xs={12}>
                {user.name}
              </Grid>
              <Grid item xs={12}>
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
    </>
  )
}

export default RoomContentFriends