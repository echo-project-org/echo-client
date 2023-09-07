import React from 'react'
import { useState, useEffect } from 'react'
import { Avatar, Button, Grid, TextField, styled, Badge, Fade } from '@mui/material'
import { CameraAlt } from '@mui/icons-material';

var api = require('../../api');

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: "30%",
    backgroundColor: '#44b700',
    color: '#44b700',
    width: "15%",
    height: "20%",
    borderRadius: "50%",
    // boxShadow: "0 0 0 8px #44b700",
  }
}));

const StyledTextField = styled(TextField)({
  "& label": {
    color: "#f5e8da",
  },
  "& label.Mui-focused": {
    color: "#f5e8da",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#f5e8da",
  },
  "& .MuiInputBase-root": {
    color: "#f5e8da",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#f5e8da",
    },
    "&:hover fieldset": {
      borderColor: "#f5e8da",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#f5e8da",

    }
  }
});

function UserSettings() {
  const [hover, setHover] = useState(false);

  const onAvatarHover = (e) => {
    if (e.type === "mouseleave") {
      setHover(false);
    } else {
      setHover(true);
    }
  }

  const computeDiv = () => {
    if (hover) {
      return (
        <Fade in={hover} timeout={200}>
          <div style={{ backgroundColor: "rgba(0,0,0,.3)", width: "80%", height: "100%", position: "absolute", zIndex: "1", borderRadius: "50%", cursor: "pointer" }} onMouseLeave={onAvatarHover} >
            <CameraAlt style={{ fontSize: "4rem", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          </div>
        </Fade>
      )
    }
    return null;
  }

  return (
    <div className="settingsModalSubDiv">
      <Grid container direction={"row"} alignItems={"center"}>
        <Grid item style={{ padding: "2rem" }} xs={2}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            {computeDiv()}
            <Avatar src={localStorage.getItem("userImage")} sx={{ height: '80%', width:'80%' }} onMouseEnter={onAvatarHover} />
          </StyledBadge>
        </Grid>
        <Grid item xs={9}>
          <Grid container direction={"row"} spacing={3}>
            <Grid item xs={4}>
              <p style={{ fontSize: '1.5rem', marginBottom: ".8rem", marginTop: "0" }}>Nickname</p>
              <StyledTextField
                hiddenLabel
                id="nameSettingsBox"
                fullWidth
                placeholder="Type your nickname here"
                size="small"
                defaultValue={localStorage.getItem("name")}
              />
            </Grid>
            <Grid item xs={4}>
              <p style={{ fontSize: '1.5rem', marginBottom: ".8rem", marginTop: "0" }}>Email</p>
              <StyledTextField
                hiddenLabel
                id="emailSettingsBox"
                fullWidth
                placeholder="Type your email here"
                size="small"
                defaultValue={localStorage.getItem("email")}
              />
            </Grid>
            <Grid item xs={4}>
              <p style={{ fontSize: '1.5rem', marginBottom: ".8rem", marginTop: "0" }}>Password</p>
              <StyledTextField
                hiddenLabel
                id="passwordSettingsBox"
                fullWidth
                placeholder="Type your password here"
                size="small"
                type='password'
                defaultValue={localStorage.getItem("password")}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" style={{ backgroundColor: "rgb(155, 95, 155)", color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>Update</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default UserSettings