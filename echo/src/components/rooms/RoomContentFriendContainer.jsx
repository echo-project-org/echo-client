import { useEffect, useState } from "react";

import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call, PersonAdd, PersonRemove } from "@mui/icons-material";

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import CurrentStatus from "../user/CurrentStatus";

const api = require('../../api');

function RoomConentFriendsButtons({ user, friendStatus }) {
  const handleFriendAccept = (e) => {
    api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'add' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'add' });
    ep.updateFriends({id: user.id, field: "requested", value: true});
  }

  const handleFriendReject = (e) => {
    api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'remove' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'remove' });
    ep.removeFriend({ id: user.id });
  }

  const handleRemoveSentRequest = (e) => {
    api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'remove' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'remove' });
    ep.removeFriend({ id: user.id });
  }

  return (
    <Container className="buttonsContainer">
      { friendStatus === "friends" ? <Button><ChatBubble /></Button> : null }
      { friendStatus === "friends" ? <Button><Call /></Button> : null }
      { friendStatus === "pending" ? <Button onClick={handleFriendAccept}><PersonAdd /></Button> : null }
      { friendStatus === "pending" ? <Button onClick={handleFriendReject}><PersonRemove /></Button> : null }
      { friendStatus === "requested" ? <Button onClick={handleRemoveSentRequest}><PersonRemove /></Button> : null }
    </Container>
  )
}

function RoomContentFriendContainer({ user, index }) {
  // friendStatus can be 'no', 'friends', 'pending', 'requested'
  const [friendStatus, setFriendStatus] = useState('no');

  useEffect(() => {
    setFriendStatus(ep.getFriendStatus(user.id));
  }, [friendStatus, user.id]);

  return (
    <StyledComponents.Friends.StyledFriendsContainer container key={"f" + index} flexDirection={"row"} display={"flex"}>
      <Grid item style={{ width: "calc(2rem + 2vw)" }}>
        <Avatar alt={user.id} src={user.userImage} />
      </Grid>
      <Grid item style={{ width: "30%", marginLeft: "1rem" }}>
        <span>{user.name}</span>
        <CurrentStatus icon={false} align={"left"} height={"2rem"} />
      </Grid>
      <Grid item style={{ width: "70%" }}>
        <RoomConentFriendsButtons user={user} friendStatus={friendStatus} />
      </Grid>
    </StyledComponents.Friends.StyledFriendsContainer>
  )
}

export default RoomContentFriendContainer