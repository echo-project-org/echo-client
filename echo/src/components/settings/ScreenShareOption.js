import React from 'react'

import { Container } from "@mui/material";

function ScreenShareOption({ device, clickHandler }) {
  return (
    <Container className="screenShareOption" maxWidth="sm" onClick={() => { clickHandler(device.id) }}>
      {
        // device.appIcon ? <img src={device.appIcon.toDataURL()} alt={device.name} className='noselect screenShareAppIcon' /> : <></>
      }
      <img src={device.thumbnail.toDataURL()} alt={device.name} className='noselect screenShareThumbnail' />
      <p className='noselect'>
        {device.name}
      </p>
    </Container>
  )
}

export default ScreenShareOption