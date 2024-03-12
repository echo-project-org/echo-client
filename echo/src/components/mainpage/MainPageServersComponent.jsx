import { Grid, Slide } from '@mui/material'

import StylingComponents from '../../StylingComponents'
import { storage } from '../..'

function MainPageServersComponent({ Server, id, enterServer }) {
  const handleClick = () => {
    //set local storage to the server id
    storage.set('serverId', Server.id);
    enterServer(Server.id);
  }

  return (
    <Slide key={Server.id} direction="right" in={true} mountOnEnter unmountOnExit timeout={id * 100} >
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
          <StylingComponents.MainPage.StyledMainPageAvatar src={Server.img} />
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
            <h3 className='noselect'>{Server.name}</h3>
            <div
              className='noselect'
              style={{
                lineBreak: "anywhere",
                height: "fit-content",
                paddingLeft: "0.8rem",
              }}
            >{Server.description}</div>
          </div>
        </Grid>
      </StylingComponents.MainPage.StyledMainPageGrid>
    </Slide>
  )
}

export default MainPageServersComponent