import "../../css/friends.css";

import { useEffect, useState } from "react";

import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call, PersonAdd, PersonRemove } from "@mui/icons-material";

import { ep, storage } from "../../index";
import CurrentStatus from "../user/CurrentStatus";
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
        }
      });
    }).catch((err) => {
      console.error(err);
    });

    api.call("users/friends/requests/" + storage.get('id'), "GET").then((res) => {
      res.json.forEach((user) => {
        if (user.id) {
          ep.addFriend({ id: user.id, accepted: true, requested: false });
        }
      });
    });

    api.call("users/friends/sentRequests/" + storage.get('id'), "GET").then((res) => {
      res.json.forEach((user) => {
        if (user.id) {
          ep.addFriend({ id: user.id, accepted: false, requested: true });
        }
      });
    });

    setFriends(ep.getFriends());
    setPending(ep.getFriendRequested());
    setRequested(ep.getFriendRequests());

    ep.on("friendCacheUpdated", "RoomContentFriends.usersCacheUpdated", (_) => {
      setFriends(ep.getFriends());
      setPending(ep.getFriendRequested());
      setRequested(ep.getFriendRequests());
    });

    return () => {
      ep.releaseGroup("RoomContentFriends.usersCacheUpdated");
    }
  }, []);

  return (
    <Container className="friends-list-container">
      <Container className="friends-list-overflow">
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
      </Container>
    </Container >
  )
}

export default RoomContentFriends