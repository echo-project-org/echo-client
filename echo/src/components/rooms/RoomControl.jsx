import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { ButtonGroup, Button, Zoom, Tooltip } from '@mui/material';
import { MicOffRounded, SignalCellularAlt, Mic, VolumeUp, VolumeOff, PhoneDisabled, Logout } from '@mui/icons-material';

import SettingsButton from '../settings/SettingsButton';
import ScreenShareSelector from '../settings/ScreenShareSelector';

import { ep, storage, ap } from "../../index";
import StylingComponents from '../../StylingComponents';

const api = require('../../lib/api')
const { ipcRenderer } = window.require('electron');

function RoomControl({ state, setState, screenSharing }) {
  const theme = useTheme();
  let navigate = useNavigate();

  const [muted, setMuted] = useState(false);
  const [deaf, setDeaf] = useState(false);
  const [wasMuted, setWasMuted] = useState(false);
  const [ping, setPing] = useState(0);
  const [rtcConnectionState, setRtcConnectionState] = useState("Disconnected");
  const [rtcConnectionStateColor, setRtcConnectionStateColor] = useState(theme.palette.error.main);
  
  useEffect(() => {
    ipcRenderer.on("toggleMute", (event, arg) => {
      muteMic();
    });

    ep.sendAudioState(sessionStorage.getItem("id"), { deaf, muted });
    ep.toggleMute(muted);
    ipcRenderer.send("updateThumbarButtons", { muted: muted, deaf: deaf });

    return () => {
      ipcRenderer.removeAllListeners("toggleMute");
    }
  }, [muted]);
  
  useEffect(() => {
    ipcRenderer.on("toggleDeaf", (event, arg) => {
      deafHeadphones();
    });

    ep.sendAudioState(sessionStorage.getItem("id"), { deaf, muted });
    ep.toggleDeaf(deaf);
    ipcRenderer.send("updateThumbarButtons", { muted: muted, deaf: deaf });

    return () => {
      ipcRenderer.removeAllListeners("toggleDeaf");
    }
  }, [deaf]);

  useEffect(() => {
    ep.on("rtcConnectionStateChange", "RoomControl.rtcConnectionStateChange", (data) => {
      switch (data.state) {
        case 'new' || 'disconnected' || 'closed':
          setRtcConnectionState("Not connected");
          setRtcConnectionStateColor(theme.palette.error.main);
          break;
        case 'connecting' || 'checking':
          setRtcConnectionState("Connecting");
          setRtcConnectionStateColor(theme.palette.warning.main);
          break;
        case 'connected':
          setRtcConnectionState("Connected");
          setRtcConnectionStateColor(theme.palette.success.main);
          break;
        case 'failed':
          setRtcConnectionState("Failed");
          setRtcConnectionStateColor(theme.palette.error.main);
          break;
        default:
          setRtcConnectionState("Not connected");
          setRtcConnectionStateColor(theme.palette.error.main);
          break;
      }
    });

    ep.on("exitedFromRoom", "RoomControl.exitedFromRoom", () => {
      setRtcConnectionState("Disconnected");
      setRtcConnectionStateColor(theme.palette.error.main);
    });

    ep.on("localUserCrashed", (data) => {
      closeConnection();
    });

    return () => {
      ipcRenderer.removeAllListeners("toggleDeaf");
      ep.releaseGroup("RoomControl.rtcConnectionStateChange");
      ep.releaseGroup("RoomControl.exitedFromRoom");
      ep.releaseGroup("localUserCrashed");
    }
  }, []);

  var interval = null;
  const updatePing = () => {
    interval = setInterval(() => {
      ep.getPing().then(ping => setPing(ping));
    }, 500);
  }
  const stopUpdatePing = () => {
    clearInterval(interval);
    interval = null;
  }
  const closeConnection = () => {
    // Notify api
    setState(false);
    if (!state) {
      api.call("users/status", "POST", { id: sessionStorage.getItem('id'), status: "0" })
        .then(res => {
          ep.closeConnection();
          // TODO: check if user is connected in room, if so change icon and action when clicked
          navigate("/");
        })
        .catch(err => {
          console.error(err);
          navigate("/");
          // clean cache and session storage
          sessionStorage.clear();
        });
    } else {
      api.call("rooms/join", "POST", { userId: sessionStorage.getItem('id'), roomId: "0", serverId: storage.get('serverId') })
        .then(res => {
          ep.exitFromRoom(sessionStorage.getItem('id'));
          ep.updateUser({ id: sessionStorage.getItem('id'), field: "currentRoom", value: 0 });
          ap.playLeaveSound();
        })
        .catch(err => {
          console.error(err);
          navigate("/");
          sessionStorage.clear();
        });
    }
  }
  const computeAudio = (isDeaf) => {
    if (isDeaf)
      if (!muted) {
        ap.playMuteSound();
      } else {
        ap.playUnmuteSound();
      }
    else
      if (!deaf) {
        ap.playDeafSound();
      } else {
        ap.playUndeafSound();
      }
  }

  const undeafOnMute = () => { setDeaf(false); }
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
    return muted;
  }

  const deafHeadphones = () => {
    if (!muted) muteOnDeaf()
    else if (muted && !deaf) muteAndDeaf()
    else unmuteOnDeaf();
    if (wasMuted && deaf) { setMuted(true); }
    setDeaf(!deaf);
    return deaf;
  }

  return (
    <StylingComponents.RoomControls.StyledRoomControlsContainer>
      <Tooltip title={ping + " ms"} onMouseEnter={updatePing} onMouseLeave={stopUpdatePing} placement="top" arrow TransitionComponent={Zoom} followCursor enterTouchDelay={20}>
        <StylingComponents.RoomControls.StyledRoomControlsConnection>
          <p style={{ color: rtcConnectionStateColor }}>{rtcConnectionState}</p>
          <p style={{ color: rtcConnectionStateColor }}><SignalCellularAlt /></p>
        </StylingComponents.RoomControls.StyledRoomControlsConnection>
      </Tooltip>
      <ButtonGroup variant='text'>
        <Tooltip title={!muted ? "Mute" : "Unmute"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
          <Button disableRipple onClick={muteMic}>
            {!muted ? <Mic /> : <MicOffRounded />}
          </Button>
        </Tooltip>
        <Tooltip title={!deaf ? "Deafen" : "Undeafen"} placement="top" arrow enterDelay={1} enterTouchDelay={20}>
          <Button disableRipple onClick={deafHeadphones}>
            {!deaf ? <VolumeUp /> : <VolumeOff />}
          </Button>
        </Tooltip>
        <ScreenShareSelector />
        <SettingsButton />
        <Tooltip title="Disconnect" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
          <Button onClick={closeConnection}>
            {state ? <PhoneDisabled /> : <Logout />}
          </Button>
        </Tooltip>
      </ButtonGroup>
    </StylingComponents.RoomControls.StyledRoomControlsContainer>
  )
}

RoomControl.defaultProps = {
  muted: false,
  deaf: false
}

export default RoomControl