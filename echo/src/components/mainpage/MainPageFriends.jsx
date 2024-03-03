import { useState, useEffect } from 'react';
import { Grid, Slide } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';

import { ep, storage } from "../../index";
import StylingComponents from '../../StylingComponents';

import CurrentStatus from "../user/CurrentStatus";

const api = require('../../lib/api');

function MainPageFriends({ }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    api.call('users/friends/' + sessionStorage.getItem("id"), "GET")
      .then((res) => {
        const _friends = [];
        for (var i in res.json.friended) {
          const data = {
            id: res.json.friended[i].id,
            name: res.json.friended[i].name,
            status: res.json.friended[i].status,
            img: res.json.friended[i].img,
            type: "friended"
          }
          _friends.push(data);
          ep.addFriend(data);
        }
        for (var i in res.json.sent) {
          const data = {
            id: res.json.sent[i].id,
            name: res.json.sent[i].name,
            status: res.json.sent[i].status,
            img: res.json.sent[i].img,
            type: "sent"
          }
          _friends.push(data);
          ep.addFriend(data);
        }
        for (var i in res.json.incoming) {
          const data = {
            id: res.json.incoming[i].id,
            name: res.json.incoming[i].name,
            status: res.json.incoming[i].status,
            img: res.json.incoming[i].img,
            type: "incoming"
          }
          _friends.push(data);
          ep.addFriend(data);
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