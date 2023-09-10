import React from 'react'

function ScreenShareOption({ device, clickHandler }) {
  return (
    <div className='screenShareOption' onClick={() => { clickHandler(device.id) }}>
      {
        device.appIcon ? <img src={device.appIcon.toDataURL()} alt={device.name} className='noselect screenShareAppIcon' /> : <></>
      }
      <img src={device.thumbnail.toDataURL()} alt={device.name} className='noselect screenShareThumbnail' />
      <p className='noselect'>
        {device.name}
      </p>
    </div>
  )
}

export default ScreenShareOption