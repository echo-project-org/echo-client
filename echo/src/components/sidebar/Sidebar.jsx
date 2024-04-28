import { useState, useEffect } from 'react';
import { Divider, Grid } from '@mui/material'
import { info } from '@lib/logger'
import Rooms from '@components/rooms/Rooms'
import RoomControl from '@components/rooms/RoomControl'
import RoomsControlsContainer from '@components/rooms/RoomsControlsContainer'

function Sidebar({ updateCurrentRoom }) {
  const [connectionState, setConnectionState] = useState(false);

  const updateConnectionState = (state) => {
    info("[Sidebar] Connection state changed")
    setConnectionState(state)
  }

  return (
    <Grid
      container
      direction={"column"}
      sx={{
        width: "18rem",
        position: "relative",
        gap: "1rem",
        flex: "1 0 auto",
      }}
    >
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <Grid item>
        <RoomsControlsContainer />
      </Grid>
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <Grid item xs={10} sm={10} md={10} lg={10} xl={10} style={{
        flex: "0.94 0 auto",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexWrap: "nowrap",
        justifyContent: "space-around"
      }}>
        <Rooms setState={updateConnectionState} connected={connectionState} updateCurrentRoom={updateCurrentRoom} />
      </Grid>
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
        <RoomControl state={connectionState} setState={updateConnectionState} />
      </Grid>
    </Grid>
  )
}

export default Sidebar