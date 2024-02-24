import React from 'react'
import { Typography, Grid, Avatar } from '@mui/material';

function MessageRight({ message }) {
  const computeMessage = (m) => {
    return m.message.split("\n").map((item, i) => {
      return <span key={i}>{item}<br /></span>;
    });
  }

  return (
    <Grid container className='rightMessage' direction={"row"} sx={{ flexFlow: "row" }}>
      <Grid item>
        <Avatar alt={message.name} src={message.img} sx={{ width: "1.5rem", height: "1.5rem" }} />
      </Grid>
      <Grid item>
        <Grid container direction={"row"} sx={{ flexFlow: "column" }}>
          <Grid item>
            <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: "1rem", textAlign: "left", color: "var(--mui-palette-primary-main)" }}>
              {message.name}
            </Typography>
          </Grid>
          <Grid item>
            <div className="messageText">
              {computeMessage(message)}
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