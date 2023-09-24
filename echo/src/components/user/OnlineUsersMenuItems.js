import React from 'react'

import { MenuItem } from '@mui/material'
import { Message, DoDisturb, Gavel, Settings } from '@mui/icons-material'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import { ep, storage } from "../../index";

function OnlineUsersMenuItems({ user, broadcastingVideo, handleClose }) {
    const startWatchingBroadcast = () => {
        ep.startReceivingVideo(user.id);
    }

    if (storage.get("id") !== user.id) {
        return (
            <>
                {broadcastingVideo ? <MenuItem onClick={startWatchingBroadcast}><ScreenShareIcon fontSize="10px" style={{ marginRight: ".3rem" }} />Watch broadcast</MenuItem> : null}
                <MenuItem onClick={handleClose}><Message fontSize="10px" style={{ marginRight: ".3rem" }} />Send message</MenuItem>
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