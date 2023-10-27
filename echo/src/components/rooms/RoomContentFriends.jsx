import { useEffect, useState } from "react";
import { Container } from "@mui/material";

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import RoomContentFriendContainer from "./RoomContentFriendContainer";

const api = require('../../api');

function RoomContentFriends({ }) {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [requested, setRequested] = useState([]);

  useEffect(() => {
    api.call("users/friends/" + storage.get('id'), "GET").then((res) => {
      res.json.forEach((user) => {
        if (user.id) {
          ep.addFriend({ id: user.id, accepted: true, requested: true });
          if (!ep.getUser(user.id)) {
            api.call("users/" + user.id, "GET").then((res) => {
              ep.addUser(res.json);
            });
          }
        }
      });
    }).catch((err) => {
      console.error(err);
    });

    api.call("users/friends/requests/" + storage.get('id'), "GET").then((res) => {
      res.json.forEach((user) => {
        console.log(user)
        if (user.id) {
          ep.addFriend({ id: user.id, accepted: true, requested: false });
          console.log(ep.getUser(user.id))
          if (!ep.getUser(user.id)) {
            api.call("users/" + user.id, "GET").then((res) => {
              ep.addUser(res.json);
            });
          }
        }
      });
    });

    api.call("users/friends/sentRequests/" + storage.get('id'), "GET").then((res) => {
      res.json.forEach((user) => {
        if (user.id) {
          ep.addFriend({ id: user.id, accepted: false, requested: true });
          if (!ep.getUser(user.id)) {
            api.call("users/" + user.id, "GET").then((res) => {
              ep.addUser(res.json);
            });
          }
        }
      });
    });

    setFriends(ep.getFriends());
    setPending(ep.getFriendRequested());
    setRequested(ep.getFriendRequests());

    ep.on("friendCacheUpdated", "RoomContentFriends.usersCacheUpdated", (_) => {
      console.log("Friend cache updated")
      console.log(ep.getFriends(), ep.getFriendRequested(), ep.getFriendRequests());
      setFriends(ep.getFriends());
      setPending(ep.getFriendRequested());
      setRequested(ep.getFriendRequests());
    });

    return () => {
      ep.releaseGroup("RoomContentFriends.usersCacheUpdated");
    }
  }, []);

  return (
    <StyledComponents.Friends.StyledFriendsListContainer>
      <StyledComponents.Friends.StyledFriendsListOverflow>
        {
          friends.map((user, index) => {
            //Friends
            return (
              <RoomContentFriendContainer user={user} index={index} key={index} />
            )
          })
        }
        {
          requested.map((user, index) => {
            //Request sent by user
            return (
              <RoomContentFriendContainer user={user} index={index} key={index} />
            )
          })
        }
        {
          pending.map((user, index) => {
            //Request sent to user
            return (
              <RoomContentFriendContainer user={user} index={index} key={index} />
            )
          })
        }
      </StyledComponents.Friends.StyledFriendsListOverflow>
    </StyledComponents.Friends.StyledFriendsListContainer>
  )
}

export default RoomContentFriends