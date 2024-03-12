import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call, PersonAdd, PersonRemove } from "@mui/icons-material";

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import CurrentStatus from "../user/CurrentStatus";

const api = require('../../lib/api');

function RoomContentFriendsButtons({ user }) {
  const handleFriendAccept = (e) => {
    // api.call("users/friend/request", "POST", { id: sessionStorage.getItem("id"), friendId: user.id, operation: 'add' })
    //   .catch(err => console.log(err));
    // send message to socket
    ep.sendToSocket("friendAction", { id: sessionStorage.getItem("id"), targetId: user.id, operation: 'add', type: 'friended' });
  }

  const handleFriendReject = (e) => {
    // api.call("users/friend/request", "POST", { id: sessionStorage.getItem("id"), friendId: user.id, operation: 'remove' })
    //   .catch(err => console.log(err));
    // send message to socket
    ep.sendToSocket("friendAction", { id: sessionStorage.getItem("id"), targetId: user.id, operation: 'remove', type: 'none' });
  }

  const handleRemoveSentRequest = (e) => {
    // api.call("users/friend/request", "POST", { id: sessionStorage.getItem("id"), friendId: user.id, operation: 'remove' })
    //   .catch(err => console.log(err));
    // send message to socket
    ep.sendToSocket("friendAction", { id: sessionStorage.getItem("id"), targetId: user.id, operation: 'remove', type: 'none' });
  }

  return (
    <Container className="buttonsContainer">
      {user.type === "friended" ? <Button><ChatBubble /></Button> : null}
      {user.type === "friended" ? <Button><Call /></Button> : null}
      {user.type === "incoming" ? <Button onClick={handleFriendAccept}><PersonAdd /></Button> : null}
      {user.type === "incoming" ? <Button onClick={handleFriendReject}><PersonRemove /></Button> : null}
      {user.type === "sent" ? <Button onClick={handleRemoveSentRequest}><PersonRemove /></Button> : null}
    </Container>
  )
}

function RoomContentFriendContainer({ user, index }) {
  return (
    <StyledComponents.Friends.StyledFriendsContainer container key={"f" + index} flexDirection={"row"} display={"flex"}>
      <Grid item style={{ width: "calc(2rem + 2vw)" }}>
        <Avatar alt={"userFriendsIcon:" + String(user.id)} src={user.img} />
      </Grid>
      <Grid item style={{ width: "30%", marginLeft: "1rem" }}>
        <span>{user.name}</span>
        <CurrentStatus icon={false} align={"left"} height={"2rem"} status={user.status} />
      </Grid>
      <Grid item style={{ width: "70%" }}>
        <RoomContentFriendsButtons user={user} />
      </Grid>
    </StyledComponents.Friends.StyledFriendsContainer>
  )
}

export default RoomContentFriendContainer