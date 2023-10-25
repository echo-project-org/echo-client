import { useState, useEffect } from 'react';
import { Container, Grid, Icon, Tooltip, styled, Slide } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion'

import MainPageFriends from './MainPageFriends';
import MainPageServers from './MainPageServers';

import { storage } from "../../index";
import StyledComponents from '../../StylingComponents';

const api = require('../../api');

function MainPage({ }) {
  const navigate = useNavigate();
  const [sidebarButtons, setSidebarButtons] = useState([
    {
      name: "Servers",
      selected: true,
      icon: "list",
      element: <MainPageServers />,
    },
    {
      name: "Friends",
      selected: false,
      icon: "people_alt",
      element: <MainPageFriends />,
    }
  ]);

  const getSelected = () => {
    for (let i = 0; i < sidebarButtons.length; i++) {
      if (sidebarButtons[i].selected) {
        return sidebarButtons[i];
      }
    }
  }

  const changeSelected = (e) => {
    const id = e.currentTarget.dataset.id;
    console.log(id, typeof id)
    setSidebarButtons((prev) => {
      return prev.map((button, index) => {
        if (index.toString() === id) {
          button.selected = true;
        } else {
          button.selected = false;
        }
        return button;
      })
    });
  }

  useEffect(() => {
    console.log("negri")
    // if id is not set, redirect to login page
    if (!storage.get("id")) {
      navigate("/login");
    }
  }, []);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
    >
      <Grid container>
        <Grid item>
          <Slide direction="right" in={true} mountOnEnter unmountOnExit>
            <StyledComponents.MainPage.StyledContainerSidebar>
              {sidebarButtons.map((button, id) => {
                return (
                  <Tooltip key={id} title={button.name} placement="right" arrow>
                    <StyledComponents.MainPage.StyledIconContainer onClick={changeSelected} data-id={id}>
                      {button.selected ?
                        <StyledComponents.MainPage.StyledSelectedIcon>{button.icon.toLocaleLowerCase()}</StyledComponents.MainPage.StyledSelectedIcon>
                        :
                        <StyledComponents.MainPage.StyledUnselectedIcon>{button.icon.toLocaleLowerCase()}</StyledComponents.MainPage.StyledUnselectedIcon>
                      }
                    </StyledComponents.MainPage.StyledIconContainer>
                  </Tooltip>
                )
              })}
            </StyledComponents.MainPage.StyledContainerSidebar>
          </Slide>
        </Grid>
        <Grid item>
          <StyledComponents.MainPage.StyledContainer>
            {getSelected().element}
          </StyledComponents.MainPage.StyledContainer>
        </Grid>
      </Grid>
    </motion.div>
  )
}

export default MainPage;