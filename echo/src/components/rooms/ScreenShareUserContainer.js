import React from 'react'
import { Avatar, Container, Grid, Typography, styled } from '@mui/material'

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
    return (
        <Grid item className="screenshareUserContainer" key={user.id} onMouseDown={() => { selectUser(user); }}>
            <Container className="screenshareUser" sx={{ background: (user.userImage ? `url(${user.userImage})` : "white") }}></Container>
            <StyledAvatar className="screenshareUserAvatar" src={user.userImage} />
            <StyledTypography variant="h4">{user.name}</StyledTypography>
        </Grid>
    )
}

export default ScreenShareUserContainer