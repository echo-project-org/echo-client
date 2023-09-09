import '../../index.css';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Zoom from '@mui/material/Zoom';
import Tooltip from "@mui/material/Tooltip";
import { ButtonGroup } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import LogoutIcon from '@mui/icons-material/Logout';

import muteSound from "../../audio/mute.mp3";
import unmuteSound from "../../audio/unmute.mp3";
import deafSound from "../../audio/deaf.mp3";
import undeafSound from "../../audio/undeaf.mp3";
import SettingsButton from '../settings/SettingsButton';

const api = require('../../api')
const ep = require('../../echoProtocol')

const theme = createTheme({
  palette: {
    primary: { main: '#f5e8da', },
    secondary: { main: '#ce8ca5', },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: "white",
          fontSize: ".9rem",
          border: "1px solid rgb(235, 144, 235)",
          background: "#3e2542",
          borderRadius: 10,
          padding: 8
        },
        arrow: {
          fontSize: 16,
          width: 17,
          "&::before": {
            border: "1px solid rgb(235, 144, 235)",
            backgroundColor: "#3e2542",
            boxSizing: "border-box"
          }
        }
      }
    }
  }
});

function RoomControl({ state, setState, screenSharing }) {
  const [muted, setMuted] = useState(false);
  const [deaf, setDeaf] = useState(false);
  const [wasMuted, setWasMuted] = useState(false);
  const [ping, setPing] = useState(0);

  let navigate = useNavigate();

  useEffect(() => { ep.sendAudioState(localStorage.getItem("id"), { deaf, muted }); ep.toggleMute(muted); }, [muted]);
  useEffect(() => { ep.sendAudioState(localStorage.getItem("id"), { deaf, muted }); }, [deaf]);

  const muteAudio = new Audio(muteSound);
  muteAudio.volume = 0.6;
  const unmuteAudio = new Audio(unmuteSound);
  unmuteAudio.volume = 0.6;
  const deafAudio = new Audio(deafSound);
  deafAudio.volume = 0.6;
  const undeafAudio = new Audio(undeafSound);
  undeafAudio.volume = 0.6;

  var interval = null;
  const updatePing = () => {
    interval = setInterval(() => {
      setPing(ep.getPing());
    }, 1000);
  }

  const stopUpdatePing = () => {
    clearInterval(interval);
    interval = null;
  }

  const closeConnection = () => {
    // Notify api
    setState(false);
    if (!state) {
      api.call("users/status", "POST", { id: localStorage.getItem('id'), status: "0" })
        .then(res => {
          ep.closeConnection();
          // TODO: check if user is connected in room, if so change icon and action when clicked
          navigate("/");
        })
        .catch(err => {
          console.error(err);
          navigate("/");
          // clean cache and local storage
          localStorage.clear();
        });
    } else {
      api.call("rooms/join", "POST", { userId: localStorage.getItem('id'), roomId: "0" })
        .then(res => {
          console.log("got response, left room")
          ep.exitFromRoom(localStorage.getItem('id'));
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  const computeAudio = (isDeaf) => {
    if (isDeaf)
      if (!muted) {
        muteAudio.play();
      } else {
        unmuteAudio.play();
      }
    else
      if (!deaf) {
        deafAudio.play();
      } else {
        undeafAudio.play();
      }
  }

  const undeafOnMute = () => { setDeaf(false);}
  const muteOnDeaf = () => { setMuted(true); computeAudio(false); }
  const unmuteOnDeaf = () => { setMuted(false); computeAudio(false); }
  const muteAndDeaf = () => { setMuted(true); setDeaf(true); computeAudio(false); }

  const muteMic = () => {
    if (muted) undeafOnMute();
    setMuted(!muted);
    if (!deaf) setWasMuted(true);
    if (wasMuted) setWasMuted(false);
    if (muted && deaf) computeAudio(false)
    if (muted && !deaf) { computeAudio(true); }
    if (!muted && !deaf) computeAudio(true)
  }

  const deafHeadphones = () => {
    
    if (!muted) muteOnDeaf()
    else if (muted && !deaf) muteAndDeaf()
    else unmuteOnDeaf();
    if (wasMuted && deaf) { setMuted(true); }
    setDeaf(!deaf);
  }

  return (
    <div className='roomControl'>
      <ThemeProvider theme={theme}>
        <Tooltip title={ ping + " ms" } onMouseEnter={updatePing} onMouseLeave={stopUpdatePing} placement="top" arrow TransitionComponent={Zoom} followCursor enterTouchDelay={20}>
          <div className="voiceConnected"><p>{state ? "Connected" : "Not connected" }</p> <p><SignalCellularAltIcon /></p></div>
        </Tooltip>
        <ButtonGroup variant='text' className='buttonGroup'>
          <Tooltip title={ !muted ? "Mute" : "Unmute" } placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Button disableRipple onClick={muteMic}>
              { !muted ? <MicIcon /> : <MicOffRoundedIcon /> }
            </Button>
          </Tooltip>
          <Tooltip title={ !deaf ? "Deafen" : "Undeafen" } placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Button disableRipple onClick={deafHeadphones}>
              { !deaf ? <VolumeUpIcon /> : <VolumeOffIcon /> }
            </Button>
          </Tooltip>
          <Tooltip title="Share Your Screen" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Button>
              { !screenSharing ? <ScreenShareIcon /> : <StopScreenShareIcon /> }
            </Button>
          </Tooltip>
            <SettingsButton />
          <Tooltip title="Disconnect" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Button onClick={closeConnection}>
              { state ? <PhoneDisabledIcon /> : <LogoutIcon /> }
            </Button>
          </Tooltip>
        </ButtonGroup>
      </ThemeProvider>
    </div>
  )
}

RoomControl.defaultProps = {
  muted: false,
  deaf: false
}

export default RoomControl