import { useEffect, useState } from "react";
import { Container } from "@mui/material";

import { ep, storage } from "@root/index";
import StyledComponents from '@root/StylingComponents';

import RoomContentFriendContainer from "./RoomContentFriendContainer";

const api = require('@lib/api');
const { error, log } = require('@lib/logger');

function RoomContentFriends({ }) {
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
        error(err.message);
      });

    ep.on("friendCacheUpdated", "RoomContentFriends.usersCacheUpdated", (data) => {
      log("RoomContentFriends.usersCacheUpdated: ", data);
      setFriends((prev) => {
        const newV = [];
        for (var i in data) {
          newV.push(data[i]);
        }
        return newV;
      });
    });

    return () => {
      ep.releaseGroup("RoomContentFriends.usersCacheUpdated");
    }
  }, []);

  return (
    <StyledComponents.Friends.StyledFriendsListContainer>
      <StyledComponents.Friends.StyledFriendsListOverflow>
        {friends.map((user, index) => {
          return <RoomContentFriendContainer user={user} index={index} key={index} />
        })}
      </StyledComponents.Friends.StyledFriendsListOverflow>
    </StyledComponents.Friends.StyledFriendsListContainer>
  )
}

export default RoomContentFriends