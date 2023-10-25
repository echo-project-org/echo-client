import { useState, useEffect } from 'react';
import { Avatar, Grid, styled, Slide } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { TransitionGroup } from 'react-transition-group';
import { motion } from 'framer-motion'
import { ep, storage } from "../../index";

const api = require('../../api');

const StyledGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    ":hover": {
      backgroundColor: theme.palette.background.light,
      cursor: "pointer",
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "4rem",
    height: "4rem",
    margin: "1.2rem",
  },
}));

function MainPageServers({ }) {
  const [servers, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // api.call('servers', "GET")
    //   .then((res) => {
    //     setFriends(res.data);
    //   })
    //   .catch((err) => {
    //     console.error(err.message);
    //   });
    setFriends([
      {
        name: "Server name",
        logo: "https://echo.kuricki.com/api/users/image/2",
        description: "This is a description of the Server",
      },
      {
        name: "Server name",
        logo: "https://echo.kuricki.com/api/users/image/3",
        description: "This is a description of the Server",
      },
      {
        name: "Server name",
        logo: "https://echo.kuricki.com/api/users/image/5",
        description: "This is a description of the Server",
      },
      {
        name: "Server name",
        logo: "https://echo.kuricki.com/api/users/image/1",
        description: "This is a description of the Server",
      },
      {
        name: "Server name",
        logo: "https://echo.kuricki.com/api/users/image/4",
        description: "This is a description of the Server",
      },
    ])
  }, []);

  const enterServer = async () => {
    // TODO: check the initial status of user (maybe get it from the login form?)
    // and check if we need to update it or not
    api.call('users/status', "POST", { id: storage.get('id'), status: "1" })
      .then((res) => {
        ep.openConnection(storage.get('id'));
        navigate("/main");

        ep.addUser({
          id: storage.get('id'),
          name: storage.get('name'),
          userImage: storage.get('userImage'),
          online: storage.get('online'),
          roomId: 0
        }, true);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }

  return (
    <TransitionGroup>
      {servers.map((Server, id) => {
        return (
          <Slide key={id} direction="right" in={true} mountOnEnter unmountOnExit timeout={id * 100}>
            <StyledGrid container flexDirection={"row"} onClick={enterServer}>
              <Grid item>
                <StyledAvatar src={Server.logo} />
              </Grid>
              <Grid item>
                <h3>{Server.name}</h3>
                <p>{Server.description}</p>
              </Grid>
            </StyledGrid>
          </Slide>
        )
      })}
    </TransitionGroup>
  )
}

export default MainPageServers;