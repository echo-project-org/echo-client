import "../../css/chat.css";

import { useState, useEffect, useLayoutEffect } from 'react'
import { Grid, Container, styled, Divider } from '@mui/material';
import InternalRoomContent from "./InternalRoomContent.jsx";

import { ep, storage } from "../../index";
import StylingComponents from '../../StylingComponents';

import RoomContentSelector from "./RoomContentSelector.jsx";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

function RoomContent({ roomId }) {
  // const [hasUsersStreaming, setHasUsersStreaming] = useState(false);
  const [contentSelected, setContentSelected] = useState("friends");
  const [roomName, setRoomName] = useState("Join a room"); // MAX 20 CHARS
  const [roomDescription, setRoomDescription] = useState("This room has no description or you are not in a room"); // MAX 150 CHARS
  const [tempChange, setTempChange] = useState(false);

  const [width, height] = useWindowSize();

  useEffect(() => {
    const roomData = ep.getRoom(roomId);
    if (roomData) {
      setRoomName(roomData.name);
      setRoomDescription(roomData.description);
    }
  }, [roomId]);

  const setContentSelectedWrap = (content) => {
    storage.set("lastContentSelected", content);
    setContentSelected(content);
  }

  useEffect(() => {
    ep.on("gotVideoStream", "RoomContent.gotVideoStream", (data) => {
      setContentSelected("screen");
    });

    ep.on("exitedFromRoom", "RoomContent.exitedFromRoom", (data) => {
      setContentSelected("friends");
    });

    ep.on("joinedRoom", "RoomContent.joinedRoom", (data) => {
      setContentSelectedWrap(storage.get("lastContentSelected") || "chat");
    });

    return () => {
      ep.releaseGroup("RoomContent.gotVideoStream");
      ep.releaseGroup("RoomContent.exitedFromRoom");
      ep.releaseGroup("RoomContent.joinedRoom");
    }
  }, [contentSelected]);

  useEffect(() => {
    if (width < 960 && !tempChange) {
      setTempChange(true);
      setRoomDescription((prev) => {
        if (prev.length > 60) {
          return prev.slice(0, 60) + "...";
        }
        return prev;
      });
    } else if (width >= 960 && tempChange) {
      setTempChange(false);
      const roomData = ep.getRoom(roomId);
      if (roomData) {
        setRoomDescription(roomData.description);
      }
    }
  }, [width, height]);

  return (
    <Grid container direction={"row"}>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{
        maxHeight: "43.09px",
      }}>
        <StylingComponents.Rooms.StyledRoomContentHeader>
          <Grid container sx={{ justifyContent: "space-between" }}>
            <Grid item sx={{ display: "flex", flexDirection: "row" }}>
              <StylingComponents.Rooms.StyledRoomTitleContainer>
                {roomName}
              </StylingComponents.Rooms.StyledRoomTitleContainer>
              <Divider orientation="vertical" backgroundColor="background" />
              <StylingComponents.Rooms.StyledRoomDescriptionContainer>
                {roomDescription}
              </StylingComponents.Rooms.StyledRoomDescriptionContainer>
            </Grid>
            <Grid item sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}>
              <RoomContentSelector roomId={roomId} contentSelected={contentSelected} setContentSelected={setContentSelectedWrap} />
            </Grid>
          </Grid>
        </StylingComponents.Rooms.StyledRoomContentHeader>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{
        height: "calc(100vh - 5rem)",
        maxHeight: "calc(100vh - 5rem)",
      }}>
        <StylingComponents.Rooms.StyledRoomContentItems>
          <InternalRoomContent roomId={roomId} contentSelected={contentSelected} />
        </StylingComponents.Rooms.StyledRoomContentItems>
      </Grid>
    </Grid>
  )
}

export default RoomContent