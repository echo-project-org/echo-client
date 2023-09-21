import React from 'react'

import { MenuItem } from '@mui/material'
import { Message, DoDisturb, Gavel, Settings } from '@mui/icons-material'

function OnlineUsersMenuItems({ user, handleClose }) {
    if (localStorage.getItem("id") !== user.id) {
        return (
            <>
                <MenuItem onClick={handleClose}><Message fontSize="10px" style={{ marginRight: ".3rem" }} />Send message</MenuItem>
                <MenuItem onClick={handleClose}><DoDisturb fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} />Kick</MenuItem>
                <MenuItem onClick={handleClose}><Gavel fontSize="10px" style={{ marginRight: ".3rem", color: "red" }} /> Ban</MenuItem>
            </>
        )
    } else {
        return (
            <>
                <MenuItem onClick={handleClose}><Settings fontSize="10px" style={{ marginRight: ".3rem" }} /> Settings</MenuItem>
            </>
        )
    }
}

export default OnlineUsersMenuItems