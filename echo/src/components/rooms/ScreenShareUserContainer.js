import React, { useEffect, useState } from 'react'
import { Avatar, Container, Grid, Typography, styled, Badge } from '@mui/material'

import { ep } from '../..';


const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        // put image in the center of parent div
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "5rem",
        height: "5rem",
    },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: theme.palette.text.main,
        opacity: "0.3",
    },
}));

function ScreenShareUserContainer({ user, selectUser }) {
    const [broadcastingVideo, setBroadcastingVideo] = useState(user.broadcastingVideo)

    useEffect(() => {
        ep.on("videoBroadcastStarted", "OnlineUserIcon.videoBroadcastStarted", (data) => {
            if (data.id === user.id) {
                setBroadcastingVideo(true)
            }
        });

        ep.on("videoBroadcastStop", "OnlineUserIcon.videoBroadcastStop", (data) => {
            if (data.id === user.id) {
                setBroadcastingVideo(false)
            }
        });
    }, [user])
    if (broadcastingVideo) {
        return (
            <Grid item className="screenshareUserContainer" key={user.id} onMouseDown={() => { selectUser(user); }}>
                <Container className="screenshareUser" sx={{ background: "red" }}></Container>
                <StyledAvatar className="screenshareUserAvatar" src={user.userImage} />
                <StyledTypography variant="h4">{user.name}</StyledTypography>
            </Grid>
        );
    } else {
        return (
            <Grid item className="screenshareUserContainer" key={user.id}>
                <Container className="screenshareUser" sx={{ background: (user.userImage ? `url(${user.userImage})` : "white") }}></Container>
                <StyledAvatar className="screenshareUserAvatar" src={user.userImage} />
                <StyledTypography variant="h4">{user.name}</StyledTypography>
            </Grid>
        );
    }
}

export default ScreenShareUserContainer