import { useState, useEffect } from 'react';
import { Grid, Slide } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';

import { ep, storage } from "@root/index";
import StylingComponents from '@root/StylingComponents';

import CurrentStatus from "@components/user/CurrentStatus";

const api = require('@lib/api');

function MainPageFriends({ }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    api.call('users/friends/' + sessionStorage.getItem("id"), "GET")
      .then((res) => {
        for (var i in res.json) {
          for (var j in res.json[i]) {
            const user = res.json[i][j];
            if (typeof user.id === "number") user.id = String(user.id);
            user.type = i;
            user.targetId = user.id;
            setFriends((prev) => { return [...prev, user]; });
            if (user) ep.addFriend(user);
          }
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  return (
    <TransitionGroup>
      {friends.map((friend, id) => {
        return (
          <Slide key={id} direction="right" in={true} mountOnEnter unmountOnExit timeout={id * 100}>
            <StylingComponents.MainPage.StyledMainPageGrid container flexDirection={"row"}>
              <Grid item>
                <StylingComponents.MainPage.StyledMainPageAvatar src={friend.img} />
              </Grid>
              <Grid item>
                <h3>{friend.name}</h3>
                <CurrentStatus icon={true} align={"left"} height={".1rem"} status={friend.status} />
              </Grid>
            </StylingComponents.MainPage.StyledMainPageGrid>
          </Slide>
        )
      })}
    </TransitionGroup>
  )
}

export default MainPageFriends;