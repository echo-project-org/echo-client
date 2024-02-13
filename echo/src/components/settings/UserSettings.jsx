import { useState, useEffect, useRef } from 'react'
import { Avatar, Button, Grid, TextField, styled, Badge, Fade, Typography } from '@mui/material'
import { CameraAlt, Circle, DoNotDisturbOn, Loop, DarkMode } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import CurrentStatus from '../user/CurrentStatus';

var api = require('../../api');

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: '12rem',
    width: '12rem',
    margin: "auto",
  },
  [theme.breakpoints.up('md')]: {
    height: '10rem',
    width: '10rem',
    margin: "auto",
  },
  [theme.breakpoints.up('lg')]: {
    height: '8rem',
    width: '8rem',
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
  },
}));

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    color: "var(--mui-palette-text-light)",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "var(--mui-palette-text-light)",
    },
    "&:hover fieldset": {
      borderColor: "var(--mui-palette-text-light)",
      border: "2px solid var(--mui-palette-text-light)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--mui-palette-text-light)",
    }
  }
});

const ComputeSelectList = ({ statusHover, changeStatus, statusSelectOn }) => {
  if (statusHover)
    return (
      <Grid container className="selectContainer-items" direction={"column"} spacing={2} sx={{ textAlign: "center" }} onMouseEnter={statusSelectOn}>
        <Grid item className="selectContainer-item" lg={12} xs={12} onMouseDown={changeStatus}>
          <Circle style={{ color: "#44b700" }} />
          Online
        </Grid>
        <Grid item className="selectContainer-item" lg={12} xs={12} onMouseDown={changeStatus}>
          <DarkMode style={{ color: "#ff8800" }} />
          Away
        </Grid>
        <Grid item className="selectContainer-item" lg={12} xs={12} onMouseDown={changeStatus}>
          <DoNotDisturbOn style={{ color: "#fd4949" }} />
          Do not disturb
        </Grid>
        <Grid item className="selectContainer-item" lg={12} xs={12} onMouseDown={changeStatus}>
          <Circle style={{ color: "#f5e8da" }} />
          Invisible
        </Grid>
      </Grid>
    )
}

const ComputeUserImage = ({ hover, uploadPicture, onAvatarHover, loading }) => {
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
            borderRadius: "50%",
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

function UserSettings() {
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusHover, setStatusHover] = useState(false);

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
          ep.emit("openUploader", { image: base64 });
          setLoading(false);
        }
      };
    };
    fileInput.click();
  }

  const statusSelectOn = () => {
    setStatusHover(true);
  }
  const statusSelectOff = () => {
    setStatusHover(false);
  }
  const changeStatus = (e) => {
    const status = e.target.innerText;
    let statusId = 0;
    switch (status) {
      case "Online":
        statusId = 1;
        break;
      case "Away":
        statusId = 2;
        break;
      case "Do not disturb":
        statusId = 3;
        break;
      case "Invisible":
        statusId = 4;
        break;
      default:
        statusId = 0;
        break;
    }
    statusId = String(statusId);
    storage.set("online", statusId);
    ep.updatePersonalSettings({ id: storage.get("id"), field: "online", value: statusId });
    api.call("users/customStatus", "POST", { id: storage.get("id"), status: statusId })
      .then((res) => { })
      .catch((err) => { console.error(err); });
    setStatusHover(false);
  }

  let navigate = useNavigate();
  const logout = () => {
    api.call("rooms/join", "POST", { userId: storage.get('id'), roomId: "0", serverId: storage.get('serverId') })
      .then(res => {
        ep.exitFromRoom(storage.get('id'));
        ep.closeConnection();
        storage.clear();
        navigate("/");
      })
      .catch(err => {
        console.error(err);
      });
  }

  return (
    <StyledComponents.Settings.StyledSettingsModalSubdiv>
      <Typography variant="h6" component="h2" sx={{ width: "95%" }} className="noselect">
        User settings
      </Typography>
      <StyledGridContainer container direction={"row"} alignItems={"center"}>
        <Grid item lg={2} md={6} xs={6} sx={{ textAlign: "center" }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            invisible
          >
            <ComputeUserImage hover={hover} uploadPicture={uploadPicture} onAvatarHover={onAvatarHover} loading={loading} />
            <StyledAvatar src={storage.get("userImage")} onMouseEnter={onAvatarHover} />
          </Badge>
          <div className="statusSelector-root" onMouseEnter={statusSelectOn} onMouseLeave={statusSelectOff}>
            <div className="statusContainer">
              <CurrentStatus />
            </div>
            <div className="selectContainer">
              <ComputeSelectList statusHover={statusHover} changeStatus={changeStatus} statusSelectOn={statusSelectOn} />
            </div>
          </div>
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
                defaultValue={storage.get("name")}
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
                defaultValue={storage.get("email")}
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
                defaultValue={storage.get("password")}
              />
            </Grid>
          </StyledGridContainer>
        </Grid>
        <Grid item lg={12} xs={12} sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            sx={{
              fontSize: "1.2rem",
              width: "25%",
              margin: "3rem 0 1rem 0"
            }}
          >Update</Button>
          <Button
            onClick={logout}
            variant="contained"
            sx={{
              fontSize: "1.2rem",
              width: "25%",
              margin: "3rem 0 1rem 2rem"
            }}
          >Logout</Button>
        </Grid>
      </StyledGridContainer>
    </StyledComponents.Settings.StyledSettingsModalSubdiv>
  )
}

export default UserSettings