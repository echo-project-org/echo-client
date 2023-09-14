import React from 'react'
import { Typography, Grid, Avatar } from '@mui/material';

function MessageRight({ message }) {
  return (
    <Grid container className='rightMessage' direction={"row"} sx={{ flexFlow: "row" }}>
      <Grid item>
        <Avatar alt={message.name} src={message.img} sx={{ width: "1.5rem", height: "1.5rem" }} />
      </Grid>
      <Grid item>
        <Grid container direction={"row"} sx={{ flexFlow: "column" }}>
          <Grid item>
            <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1rem", textAlign: "left", color: "rgb(115, 24, 115)" }}>
              {message.name}
            </Typography>
          </Grid>
          <Grid item>
            <div className="messageText">
              {message.message}
            </div>
          </Grid>
          <Grid item>
            <div className="messageDate">
              {message.dateDisplay}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MessageRight