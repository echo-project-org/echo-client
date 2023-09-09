import CardContent from '@mui/material/CardContent';
import { CardMedia } from '@mui/material'
import Card from '@mui/material/Card';
import React from 'react'

function ScreenShareOption({ device }) {
    return (
        <div className='screenShareOption'>
            <img src={device.thumbnail.toDataURL()} alt={device.name} className='noselect'/>
            <p className='noselect'>
                {device.name}
            </p>
        </div>
    )
}

export default ScreenShareOption