import { useState, useEffect } from 'react';
import { Grid, Slide } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';

import { ep, storage } from "../../index";
import StylingComponents from '../../StylingComponents';

import CurrentStatus from "../user/CurrentStatus";

const api = require('../../api');

function MainPageFriends({ }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    api.call('users/friends/' + storage.get("id"), "GET")
      .then((res) => {
        const _friends = [];
        for (var i in res.json.friended) {
          _friends.push({
            id: res.json.friended[i].id,
            name: res.json.friended[i].name,
            status: res.json.friended[i].status,
            img: res.json.friended[i].img,
            type: "friended"
          })
        }
        for (var i in res.json.sent) {
          _friends.push({
            id: res.json.sent[i].id,
            name: res.json.sent[i].name,
            status: res.json.sent[i].status,
            img: res.json.sent[i].img,
            type: "sent"
          })
        }
        for (var i in res.json.incoming) {
          _friends.push({
            id: res.json.incoming[i].id,
            name: res.json.incoming[i].name,
            status: res.json.incoming[i].status,
            img: res.json.incoming[i].img,
            type: "incoming"
          })
        }
        setFriends(_friends);
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
                <CurrentStatus icon={true} align={"left"} height={".1rem"} online={friend.status} />
              </Grid>
            </StylingComponents.MainPage.StyledMainPageGrid>
          </Slide>
        )
      })}
    </TransitionGroup>
  )
}

export default MainPageFriends;