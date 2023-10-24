import "../../css/friends.css";

import { useEffect, useState } from "react";

import { Avatar, Grid, Container, Button } from "@mui/material";
import { ChatBubble, Call, PersonAdd, PersonRemove } from "@mui/icons-material";

import { ep, storage } from "../../index";
import CurrentStatus from "../user/CurrentStatus";

const api = require('../../api');
function RoomContentFriendContainer({ user, index }) {
    const [friendStatus, setFriendStatus] = useState('no');

    useEffect(() => {
        setFriendStatus(ep.getFriendStatus(user.id));
    }, [friendStatus, user.id]);


    const handleFriendAccept = (e) => {
        api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'add' });
        ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'add' });
        ep.updateFriends({ id: user.id, requested: true, accepted: true });
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

    if (friendStatus === 'no') {
        return null;
    }
    if (friendStatus === 'friends') {
        return (
            <Grid container className="friend-container" key={"f" + index} flexDirection={"row"} display={"flex"}>
                <Grid item xs={1}>
                    <Avatar className="userAvatar" alt={user.id} src={user.userImage} />
                </Grid>
                <Grid item xs={3} className="userInfo">
                    <span className="userName">{user.name}</span>
                    <CurrentStatus icon={false} align={"left"} height={"2rem"} />
                </Grid>
                <Grid item xs={8}>
                    <Container className="buttonsContainer">
                        <Button>
                            <ChatBubble />
                        </Button>
                        <Button>
                            <Call />
                        </Button>
                    </Container>
                </Grid>
            </Grid>
        )
    }
    if (friendStatus === 'pending') {
        return (
            <Grid container className="friend-container" key={"r" + index} flexDirection={"row"} display={"flex"}>
                <Grid item xs={1}>
                    <Avatar className="userAvatar" alt={user.id} src={user.userImage} />
                </Grid>
                <Grid item xs={3} className="userInfo">
                    <span className="userName">{user.name}</span>
                    <CurrentStatus icon={false} align={"left"} height={"2rem"} />
                </Grid>
                <Grid item xs={8}>
                    <Container className="buttonsContainer">
                        <Button onClick={handleFriendAccept}>
                            <PersonAdd />
                        </Button>
                        <Button onClick={handleFriendReject}>
                            <PersonRemove />
                        </Button>
                    </Container>
                </Grid>
            </Grid>
        )
    }
    if (friendStatus === 'requested') {
        return (
            <Grid container className="friend-container" key={"p" + index} flexDirection={"row"} display={"flex"}>
                <Grid item xs={1}>
                    <Avatar className="userAvatar" alt={user.id} src={user.userImage} />
                </Grid>
                <Grid item xs={3} className="userInfo">
                    <span className="userName">{user.name}</span>
                    <CurrentStatus icon={false} align={"left"} height={"2rem"} />
                </Grid>
                <Grid item xs={8}>
                    <Container className="buttonsContainer">
                        <Button onClick={handleRemoveSentRequest}>
                            <PersonRemove />
                        </Button>
                    </Container>
                </Grid>
            </Grid>
        )
    }
}

export default RoomContentFriendContainer