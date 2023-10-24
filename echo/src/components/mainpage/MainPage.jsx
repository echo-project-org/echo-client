import { useState, useEffect } from 'react';
import { Avatar, Container, Grid, Icon, Tooltip, styled } from '@mui/material';
import { List, PeopleAlt } from '@mui/icons-material';

import MainPageFriends from './MainPageFriends';
import MainPageServers from './MainPageServers';

const api = require('../../api');

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: 'calc(100vh - 2rem)',
    width: '98%',
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
    width: '98%',
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
  const [sidebarButtons, setSidebarButtons] = useState([
    {
      name: "Servers",
      selected: true,
      icon: "list",
      element: <MainPageServers/>,
    },
    {
      name: "Friends",
      selected: false,
      icon: "people_alt",
      element: <MainPageFriends/>,
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

  return (
    <Grid container>
      <Grid item xs={1} md={1} lg={0.8}>
        <StyledContainerSidebar>
          {sidebarButtons.map((button, id) => {
            return (
              <Tooltip title={button.name} placement="right" arrow>
                <StyledIconContainer key={id} onClick={changeSelected} data-id={id}>
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
      </Grid>
      <Grid item xs={11} md={11} lg={11.2}>
        <StyledContainer>
          {getSelected().element}
        </StyledContainer>
      </Grid>
    </Grid>
  )
}

export default MainPage;