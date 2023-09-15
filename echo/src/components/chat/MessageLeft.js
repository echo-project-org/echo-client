import React from 'react'
import { Typography, Grid, Avatar } from '@mui/material';

function MessageLeft({ message }) {
  const sanitize = (input) => {
    const doc = new DOMParser().parseFromString(input, 'text/html');
    for (const elm of doc.querySelectorAll('*')) {
      for (const attrib of elm.attributes) {
        if (attrib.name.startsWith('on')) {
          elm.removeAttribute(attrib.name);
        }
      }
    }
    return doc.body.innerHTML;
  };

  return (
    <Grid container className='leftMessage' direction={"row"} sx={{ flexFlow: "row" }}>
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
            <div className="messageText" dangerouslySetInnerHTML={{ __html: sanitize(message.message) }}></div>
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

export default MessageLeft