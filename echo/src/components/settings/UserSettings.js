import React from 'react'
import { useState, useEffect } from 'react'
import { Avatar, Button, Grid, TextField, styled, Badge, Fade, Divider } from '@mui/material'
import { CameraAlt, Loop } from '@mui/icons-material';

import { ep } from "../../index";

var api = require('../../api');

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: '12rem',
    width:'12rem',
    margin: "auto",
  },
  [theme.breakpoints.up('md')]: {
    height: '10rem',
    width:'10rem',
    margin: "auto",
  },
  [theme.breakpoints.up('lg')]: {
    height: '8rem',
    width:'8rem',
    margin: "auto",
  },
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    justifyContent: "center",
    alignItems: "center",
  },
  [theme.breakpoints.up('lg')]: {
    justifyContent: "center",
    alignItems: "center",
    // columnGap: ".1rem"
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: "15%",
    backgroundColor: '#44b700',
    color: '#44b700',
    width: "20%",
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
  const [loading, setLoading] = useState(false);

  const onAvatarHover = (e) => {
    if (e.type === "mouseleave") {
      setHover(false);
    } else {
      setHover(true);
    }
  }

  const uploadPicture = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // compress image
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const elem = document.createElement('canvas');
          const width = 512;
          const scaleFactor = width / img.width;
          elem.width = width;
          elem.height = img.height * scaleFactor;
          const ctx = elem.getContext('2d');
          ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);
          const base64 = ctx.canvas.toDataURL();

          setLoading(true);
          
          api.call("users/image", "POST", { id: localStorage.getItem("id"), image: base64 })
            .then((res) => {
              localStorage.setItem("userImage", base64);
              ep.updatePersonalSettings({ id: localStorage.getItem("id"), field: "userImage", value: base64 });
              setLoading(false);
            })
            .catch(err => {
              console.error(err);
            });
        }
      };
    };
    fileInput.click();
  }

  const computeDiv = () => {
    if (hover) {
      return (
        <Fade in={hover} timeout={200}>
          <div
            style={{
              backgroundColor: "rgba(0,0,0,.3)",
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: "1",
              borderRadius:
              "50%",
              cursor: "pointer"
            }}
            onMouseDown={uploadPicture}
            onMouseLeave={onAvatarHover} >
            <CameraAlt style={{ fontSize: "4rem", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
          </div>
        </Fade>
      )
    }
    if (loading) {
      return (
        <Fade in={loading} timeout={200}>
          <div
            style={{
              backgroundColor: "rgba(0,0,0,.5)",
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: "1",
              borderRadius: "50%",
              cursor: "pointer"
            }}
          >            
            <Loop style={{ fontSize: "4rem", position: "absolute", top: "25%", left: "25%" }} className='rotating' />
          </div>
        </Fade>
      )
    }
    return null;
  }

  return (
    <div className="settingsModalSubDiv">
      <StyledGridContainer container direction={"row"} alignItems={"center"}>
        <Grid item lg={2} md={4} xs={6} sx={{ textAlign: "center" }}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            {computeDiv()}
            <StyledAvatar src={localStorage.getItem("userImage")} onMouseEnter={onAvatarHover} />
          </StyledBadge>
          <Divider style={{ background: '#f5e8da' }} orientation="vertical" variant="middle" flexItem />
        </Grid>
        <Grid item lg={10} md={9} xs={6}>
          <StyledGridContainer container direction={"row"} spacing={3}>
            <Grid item lg={5.9} xs={12}>
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
            <Grid item lg={5.9} xs={12}>
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
            <Grid item lg={11.8} xs={12}>
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
          </StyledGridContainer>
        </Grid>
        <Grid item lg={12} xs={12} sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            style={{
              backgroundColor: "rgb(155, 95, 155)",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.2rem",
              width: "20%",
              transition: "all .1s ease-in-out",
              margin: "3rem 0 1rem 0"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "rgb(215, 124, 215)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "rgb(155, 95, 155)"}
            onMouseDown={(e) => e.target.style.backgroundColor = "rgb(185, 125, 185)"}
            onMouseUp={(e) => e.target.style.backgroundColor = "rgb(215, 124, 215)"}
            disableRipple
          >Update</Button>
        </Grid>
      </StyledGridContainer>
    </div>
  )
}

export default UserSettings