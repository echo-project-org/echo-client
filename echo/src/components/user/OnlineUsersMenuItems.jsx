import React from 'react'
import { useState, useEffect } from 'react'
import { MenuItem } from '@mui/material'
import { Message, DoDisturb, Gavel, Settings, PersonAdd, PersonRemove } from '@mui/icons-material'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import { ep, storage } from "../../index";

const api = require('../../api');

function OnlineUsersMenuItems({ user, broadcastingVideo, handleClose }) {
    const [isFriend, setIsFriend] = useState(true);

    const startWatchingBroadcast = () => {
        ep.startReceivingVideo(user.id);
    }

    const handleFriendAdd = () => {
        setIsFriend(true);
        //notify api or whatever needs to be updated
        api.call("users/friend/request", 'POST', { id: storage.get("id"), friendId: user.id, operation: 'add' });
        ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'add'});
        handleClose();
    }

    const handleFriendRemove = () => {
        setIsFriend(false);
        //notify api or whatever needs to be updated
        api.call("users/friend/request", "POST",{ id: storage.get("id"), friendId: user.id, operation: 'remove' });
        ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'remove'});
        handleClose();
    }

    if (storage.get("id") !== user.id) {
        return (
            <>
                {broadcastingVideo ? <MenuItem onClick={startWatchingBroadcast}><ScreenShareIcon fontSize="10px" style={{ marginRight: ".3rem" }} />Watch broadcast</MenuItem> : null}
                <MenuItem onClick={handleClose}><Message fontSize="10px" style={{ marginRight: ".3rem" }} />Send message</MenuItem>
                {
                    isFriend ?
                        <MenuItem onClick={handleFriendRemove}><PersonRemove fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} />Remove friend</MenuItem>
                        :
                        <MenuItem onClick={handleFriendAdd}><PersonAdd fontSize="10px" style={{ marginRight: ".3rem" }} /> Ad friend</MenuItem>
                }
                <MenuItem onClick={handleClose}><DoDisturb fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} />Kick</MenuItem>
                <MenuItem onClick={handleClose}><Gavel fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} /> Ban</MenuItem>
            </>
        )
    } else {
        return (
            <>
                {broadcastingVideo ? <MenuItem onClick={startWatchingBroadcast}><ScreenShareIcon fontSize="10px" style={{ marginRight: ".3rem" }} />Watch broadcast</MenuItem> : null}
                <MenuItem onClick={handleClose}><Settings fontSize="10px" style={{ marginRight: ".3rem" }} /> Settings</MenuItem>
            </>
        )
    }
}

export default OnlineUsersMenuItems