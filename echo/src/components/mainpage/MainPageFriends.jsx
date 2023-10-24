import { useState, useEffect } from 'react';
import { Avatar, Grid, styled } from '@mui/material';

const api = require('../../api');

const StyledGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    ":hover": {
      backgroundColor: theme.palette.background.light,
      cursor: "pointer",
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "4rem",
    height: "4rem",
    margin: "1.2rem",
  },
}));

function MainPageFriends({ }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // api.call('friends', "GET")
    //   .then((res) => {
    //     setFriends(res.data);
    //   })
    //   .catch((err) => {
    //     console.error(err.message);
    //   });
    setFriends([
      {
        name: "Friend name",
        logo: "https://echo.kuricki.com/api/users/image/3",
        description: "This is a description of the Friend",
      },
      {
        name: "Friend name",
        logo: "https://echo.kuricki.com/api/users/image/2",
        description: "This is a description of the Friend",
      },
      {
        name: "Friend name",
        logo: "https://echo.kuricki.com/api/users/image/1",
        description: "This is a description of the Friend",
      },
      {
        name: "Friend name",
        logo: "https://echo.kuricki.com/api/users/image/5",
        description: "This is a description of the Friend",
      },
      {
        name: "Friend name",
        logo: "https://echo.kuricki.com/api/users/image/4",
        description: "This is a description of the Friend",
      },
    ])
  }, []);

  return (
    <>
      {friends.map((friend, id) => {
        return (
          <StyledGrid container key={id} flexDirection={"row"}>
            <Grid item xs={2.5} md={2} lg={1.5}>
              <StyledAvatar src={friend.logo} />
            </Grid>
            <Grid item xs={9}>
              <h3>{friend.name}</h3>
              <p>{friend.description}</p>
            </Grid>
          </StyledGrid>
        )
      })}
    </>
  )
}

export default MainPageFriends;