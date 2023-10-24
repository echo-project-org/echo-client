import { useState, useEffect } from 'react';
import { Container, Grid, Icon, Tooltip, styled, Slide } from '@mui/material';
import { useNavigate } from "react-router-dom";

import MainPageFriends from './MainPageFriends';
import MainPageServers from './MainPageServers';

import { storage } from "../../index";

const api = require('../../api');

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: 'calc(100vh - 2rem)',
    width: 'calc(100vw - 7rem)',
    marginLeft: ".5rem",
    borderRadius: "1rem",
    color: "white",
    textAlign: "left",
    backgroundColor: theme.palette.background.dark,
    overflow: "auto",
    maxWidth: "100% !important",
  },
}));

const StyledContainerSidebar = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: 'calc(100vh - 2rem)',
    width: '6rem',
    borderRadius: "0 .4rem .4rem 0",
    color: "white",
    textAlign: "center",
    backgroundColor: theme.palette.background.dark,
    overflow: "auto",
  }
}));

const StyledIconContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    justifyContent: "center",
    height: "5rem",
    width: "100%",
    // put content in the middle
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.dark,
    ":hover": {
      backgroundColor: theme.palette.background.light,
      cursor: "pointer",
    },
  }
}));

const StyledSelectedIcon = styled(Icon)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    color: theme.palette.text.light,
    fontSize: "2rem",
    transition: "all .2s ease-in-out",
    fontSize: "3rem",
  },
}));

const StyledUnselectedIcon = styled(Icon)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    color: theme.palette.text.dark,
    fontSize: "2rem",
    transition: "all .2s ease-in-out",
  },
}));

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
    // if id is not set, redirect to login page
    if (!storage.get("id")) {
      navigate("/login");
    }
  });

  return (
    <Grid container>
      <Grid item>
        <Slide direction="right" in={true} mountOnEnter unmountOnExit>
          <StyledContainerSidebar>
            {sidebarButtons.map((button, id) => {
              return (
                <Tooltip key={id} title={button.name} placement="right" arrow>
                  <StyledIconContainer onClick={changeSelected} data-id={id}>
                    {button.selected ?
                      <StyledSelectedIcon>{button.icon.toLocaleLowerCase()}</StyledSelectedIcon>
                      :
                      <StyledUnselectedIcon>{button.icon.toLocaleLowerCase()}</StyledUnselectedIcon>
                    }
                  </StyledIconContainer>
                </Tooltip>
              )
            })}
          </StyledContainerSidebar>
        </Slide>
      </Grid>
      <Grid item>
        <StyledContainer>
          {getSelected().element}
        </StyledContainer>
      </Grid>
    </Grid>
  )
}

export default MainPage;