import { useEffect, useState } from "react";
import { Container } from "@mui/material";

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import RoomContentFriendContainer from "./RoomContentFriendContainer";

const api = require('../../lib/api');

function RoomContentFriends({ }) {
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

    ep.on("friendCacheUpdated", "RoomContentFriends.usersCacheUpdated", (data) => {
      console.log("RoomContentFriends.usersCacheUpdated: ", data);
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