import { useState, useEffect } from 'react';
import { Grid, Tooltip, Slide } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion'

import MainPageFriends from '../components/mainpage/MainPageFriends';
import MainPageServers from '../components/mainpage/MainPageServers';
import SettingsView from '@components/settings/SettingsView';

import { storage, ep } from "@root/index";
import StyledComponents from '@root/StylingComponents';

const api = require('@lib/api');
const { error } = require('@lib/logger');

function MainPage() {
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
    },
    {
      name: "Settings",
      selected: false,
      icon: "settings",
      element: <StyledComponents.Settings.StyledSettingsView><SettingsView /></StyledComponents.Settings.StyledSettingsView>,
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
    ep.on("tokenExpired", "MainPage.tokenExpired", (data) => {
      ep.closeConnection();
      sessionStorage.clear();
      storage.remove("token");
      navigate("/login");
    });

    // if id is not set, try to get it from the token
    if (!sessionStorage.getItem("id")) {
      if (storage.get("token") === undefined || storage.get("token") === null) {
        navigate("/login");
      } else {
        api.call("auth/verify", "GET")
          .then((data) => {
            sessionStorage.setItem("id", data.json.id);
            sessionStorage.setItem("name", data.json.name);
            sessionStorage.setItem("email", data.json.email);
            sessionStorage.setItem("userImage", data.json.img);
            storage.set("status", data.json.status);
            storage.set("online", data.json.online);
            storage.set("token", data.json.token);
            storage.set("email", data.json.email);
          })
          .catch((err) => {
            error(err);
            navigate("/login");
          });
      }
    }

    return () => {
      ep.releaseGroup("MainPage.tokenExpired");
    }
  }, [navigate]);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
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