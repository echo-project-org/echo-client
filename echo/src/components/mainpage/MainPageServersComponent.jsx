import React from 'react'
import { useState, useEffect } from 'react'
import { Grid, Slide } from '@mui/material'
import StylingComponents from '../../StylingComponents'
import { storage } from '../..'

function MainPageServersComponent({ Server, id, enterServer}) {
    const handleClick = () => {
        //set local storage to the server id
        storage.set('serverId', Server.id);
        enterServer(Server.id);
    }
    return (
        <Slide key={Server.id} direction="right" in={true} mountOnEnter unmountOnExit timeout={id * 100} >
            <StylingComponents.MainPage.StyledMainPageGrid container flexDirection={"row"} onClick={handleClick}>
                <Grid item>
                    <StylingComponents.MainPage.StyledMainPageAvatar src={Server.img}/>
                </Grid>
                <Grid item>
                    <h3 className='noselect'>{Server.name}</h3>
                    <p className='noselect'>{Server.description}</p>
                </Grid>
            </StylingComponents.MainPage.StyledMainPageGrid>
        </Slide>
    )
}

export default MainPageServersComponent