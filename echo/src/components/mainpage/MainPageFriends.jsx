import { useState, useEffect } from 'react';
import { Grid, Slide } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';

import { ep, storage } from "../../index";
import StylingComponents from '../../StylingComponents';

const api = require('../../api');

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
    <TransitionGroup>
      {friends.map((friend, id) => {
        return (
          <Slide key={id} direction="right" in={true} mountOnEnter unmountOnExit timeout={id * 100}>
            <StylingComponents.MainPage.StyledMainPageGrid container flexDirection={"row"}>
              <Grid item>
                <StylingComponents.MainPage.StyledMainPageAvatar src={friend.logo} />
              </Grid>
              <Grid item>
                <h3>{friend.name}</h3>
                <p>{friend.description}</p>
              </Grid>
            </StylingComponents.MainPage.StyledMainPageGrid>
          </Slide>
        )
      })}
    </TransitionGroup>
  )
}

export default MainPageFriends;