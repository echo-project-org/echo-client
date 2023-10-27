import { useEffect, useState } from "react";
import { Container } from "@mui/material";

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import RoomContentFriendContainer from "./RoomContentFriendContainer";

const api = require('../../api');

function RoomContentFriends({ }) {
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


    setFriends(ep.getFriends());

    ep.on("friendCacheUpdated", "RoomContentFriends.usersCacheUpdated", (_) => {
      setFriends(ep.getFriends());
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