import { useState, useEffect } from 'react';
import { ButtonGroup, Button, Zoom, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MicOffRounded, SignalCellularAlt, Mic, VolumeUp, VolumeOff, PhoneDisabled, Logout } from '@mui/icons-material';

import SettingsButton from '../settings/SettingsButton';
import ScreenShareSelector from '../settings/ScreenShareSelector';

import { ep, storage } from "../../index";

const muteSound = require("../../audio/mute.mp3");
const unmuteSound = require("../../audio/unmute.mp3");
const deafSound = require("../../audio/deaf.mp3");
const undeafSound = require("../../audio/undeaf.mp3");
const leaveSound = require("../../audio/leave.mp3");

const api = require('../../api')

function RoomControl({ state, setState, screenSharing }) {
  const [muted, setMuted] = useState(false);
  const [deaf, setDeaf] = useState(false);
  const [wasMuted, setWasMuted] = useState(false);
  const [ping, setPing] = useState(0);
  const [rtcConnectionState, setRtcConnectionState] = useState("Disconnected");

  let navigate = useNavigate();

  useEffect(() => { ep.sendAudioState(storage.get("id"), { deaf, muted }); ep.toggleMute(muted); }, [muted]);
  useEffect(() => { ep.sendAudioState(storage.get("id"), { deaf, muted }); ep.toggleDeaf(deaf); }, [deaf]);
  useEffect(() => {
    ep.on("rtcConnectionStateChange", "RoomControl.rtcConnectionStateChange", (data) => {
      switch (data.state) {
        case 'new': setRtcConnectionState("Not connected"); break;
        case 'disconnected': setRtcConnectionState("Not connected"); break;
        case 'connecting': setRtcConnectionState("Connecting"); break;
        case 'connected': setRtcConnectionState("Connected"); break;
        case 'failed': setRtcConnectionState("Failed"); break;
        case 'closed': setRtcConnectionState("Not connected"); break;
        default: setRtcConnectionState("Not connected"); break;
      }
    });

    ep.on("exitedFromRoom", "RoomControl.exitedFromRoom", () => {
      setRtcConnectionState("Disconnected");
    });

    ep.on("localUserCrashed", (data) => {
      closeConnection();
    });
  }, []);
  const muteAudio = new Audio(muteSound);
  muteAudio.volume = 0.6;
  const unmuteAudio = new Audio(unmuteSound);
  unmuteAudio.volume = 0.6;
  const deafAudio = new Audio(deafSound);
  deafAudio.volume = 0.6;
  const undeafAudio = new Audio(undeafSound);
  undeafAudio.volume = 0.6;
  const leaveAudio = new Audio(leaveSound);
  leaveAudio.volume = 0.6;

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
      api.call("users/status", "POST", { id: storage.get('id'), status: "0" })
        .then(res => {
          ep.closeConnection();
          // TODO: check if user is connected in room, if so change icon and action when clicked
          navigate("/");
        })
        .catch(err => {
          console.error(err);
          navigate("/");
          // clean cache and local storage
          storage.clear();
        });
    } else {
      api.call("rooms/join", "POST", { userId: storage.get('id'), roomId: "0" })
        .then(res => {
          ep.exitFromRoom(storage.get('id'));
          ep.updateUser({ id: storage.get('id'), field: "currentRoom", value: 0 });
          leaveAudio.play();
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

  const undeafOnMute = () => { setDeaf(false); }
  const muteOnDeaf = () => { setMuted(true); computeAudio(false); }
  const unmuteOnDeaf = () => { setMuted(false); computeAudio(false); }
  const muteAndDeaf = () => { setMuted(true); setDeaf(true); computeAudio(false); }

  const muteMic = () => {
    if(ep.getUser(storage.get('id')).currentRoom === '0'){
      console.warn("User must must be in room to mute");
      return;
    }
    if (muted) undeafOnMute();
    setMuted(!muted);
    if (!deaf) setWasMuted(true);
    if (wasMuted) setWasMuted(false);
    if (muted && deaf) computeAudio(false)
    if (muted && !deaf) { computeAudio(true); }
    if (!muted && !deaf) computeAudio(true)
  }

  const deafHeadphones = () => {
    if(ep.getUser(storage.get('id')).currentRoom === '0'){
      console.warn("User must must be in room to deafen");
      return;
    }

    if (!muted) muteOnDeaf()
    else if (muted && !deaf) muteAndDeaf()
    else unmuteOnDeaf();
    if (wasMuted && deaf) { setMuted(true); }
    setDeaf(!deaf);
  }

  return (
    <div className='roomControl'>
      <Tooltip title={ping + " ms"} onMouseEnter={updatePing} onMouseLeave={stopUpdatePing} placement="top" arrow TransitionComponent={Zoom} followCursor enterTouchDelay={20}>
        <div className="voiceConnected"><p>{rtcConnectionState}</p> <p><SignalCellularAlt /></p></div>
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
    </div>
  )
}

RoomControl.defaultProps = {
  muted: false,
  deaf: false
}

export default RoomControl