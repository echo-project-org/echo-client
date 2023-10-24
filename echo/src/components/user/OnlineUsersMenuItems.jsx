import React from 'react'
import { useState, useEffect } from 'react'
import { MenuItem } from '@mui/material'
import { Message, DoDisturb, Gavel, Settings, PersonAdd, PersonRemove, ScreenShare } from '@mui/icons-material'

import { ep, storage } from "../../index";

const api = require('../../api');

function FriendButton({ user, handleClose }) {
  const [friendStatus, setFriendStatus] = useState('no');

  const handleFriendAdd = () => {
    setFriendStatus('requested');
    //notify api or whatever needs to be updated
    api.call("users/friend/request", 'POST', { id: storage.get("id"), friendId: user.id, operation: 'add' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'add' });
    ep.addFriend({ id: user.id, requested: true, accepted: false })
    handleClose();
  }

  const handleFriendRemove = () => {
    setFriendStatus('no');
    //notify api or whatever needs to be updated
    api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'remove' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'remove' });
    ep.removeFriend({ id: user.id });
    handleClose();
  }

  const handleFriendAccept = () => {
    //notify api or whatever needs to be updated
    api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'add' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'add' });
    ep.updateFriends({ id: user.id, requested: true, accepted: true });
    handleClose();
  }

  const handleFriendReject = () => {
    api.call("users/friend/request", "POST", { id: storage.get("id"), friendId: user.id, operation: 'remove' });
    ep.sendFriendAction({ id: storage.get("id"), targetId: user.id, operation: 'remove' });
    ep.removeFriend({ id: user.id });
    handleClose();
  }

  useEffect(() => {
    setFriendStatus(ep.getFriendStatus(user.id));
  }, [friendStatus, user.id]);

  switch (friendStatus) {
    case "no":
      return <MenuItem onClick={handleFriendAdd}><PersonAdd fontSize="10px" style={{ marginRight: ".3rem" }} /> Ad friend</MenuItem>
    case "requested":
      return <MenuItem disabled={true}><PersonAdd fontSize="10px" style={{ marginRight: ".3rem" }} /> Request sent</MenuItem>
    case 'pending':
      return (
        <>
          <MenuItem onClick={handleFriendAccept}><PersonAdd fontSize="10px" style={{ marginRight: ".3rem" }} /> Accept</MenuItem>
          <MenuItem onClick={handleFriendReject}><PersonRemove fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} /> Reject</MenuItem>
        </>
      )
    case "friend":
      return <MenuItem onClick={handleFriendRemove}><PersonRemove fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} />Remove friend</MenuItem>
    default:
      return null;
  }
}

function OnlineUsersMenuItems({ user, broadcastingVideo, handleClose }) {
  const startWatchingBroadcast = () => {
    ep.startReceivingVideo(user.id);
  }

  if (storage.get("id") !== user.id) {
    return (
      <>
        {broadcastingVideo ? <MenuItem onClick={startWatchingBroadcast}><ScreenShare fontSize="10px" style={{ marginRight: ".3rem" }} />Watch broadcast</MenuItem> : null}
        <MenuItem onClick={handleClose}><Message fontSize="10px" style={{ marginRight: ".3rem" }} />Send message</MenuItem>
        <FriendButton user={user} handleClose={handleClose} />
        <MenuItem onClick={handleClose}><DoDisturb fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} />Kick</MenuItem>
        <MenuItem onClick={handleClose}><Gavel fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} /> Ban</MenuItem>
      </>
    )
  } else {
    return (
      <>
        {broadcastingVideo ? <MenuItem onClick={startWatchingBroadcast}><ScreenShare fontSize="10px" style={{ marginRight: ".3rem" }} />Watch broadcast</MenuItem> : null}
        <MenuItem onClick={handleClose}><Settings fontSize="10px" style={{ marginRight: ".3rem" }} /> Settings</MenuItem>
      </>
    )
  }
}

export default OnlineUsersMenuItems