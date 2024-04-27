import { Grid, Slide } from '@mui/material'
import { Storage } from '@mui/icons-material'

import StylingComponents from '@root/StylingComponents'
import { storage } from '@root'
import { info } from '@lib/logger'

function MainPageServersComponent({ server, id, enterServer }) {
  if (!server) return null;

  const handleClick = () => {
    //set local storage to the server id
    info("[MainPageServersComponent] User clicked server")
    storage.set('serverId', server.id);
    enterServer(server.id);
  }

  return (
    <Slide key={server.id} direction="right" in={true} mountOnEnter unmountOnExit timeout={id * 100} >
      <StylingComponents.MainPage.StyledMainPageGrid container flexDirection={"row"} onClick={handleClick}>
        <Grid
          item
          xs={2}
          style={{
            display: "flex",
            flex: "0 0 auto",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <StylingComponents.MainPage.StyledMainPageAvatar src={server.img || ""}>
            <Storage />
          </StylingComponents.MainPage.StyledMainPageAvatar>
        </Grid>
        <Grid
          item
          xs={10}
          style={{
            display: "flex",
            flex: "1 0 auto",
          }}
        >
          <div style={{ width: "100%" }}>
            <h3 className='noselect'>{server.name}</h3>
            <div
              className='noselect'
              style={{
                lineBreak: "auto",
                height: "fit-content",
                paddingLeft: "0.8rem",
              }}
            >{server.description}</div>
          </div>
        </Grid>
      </StylingComponents.MainPage.StyledMainPageGrid>
    </Slide>
  )
}

export default MainPageServersComponent