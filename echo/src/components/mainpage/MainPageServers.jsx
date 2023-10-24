import { useState, useEffect } from 'react';
import { Avatar, Grid, styled } from '@mui/material';
import { useNavigate } from "react-router-dom";

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

  const enterServer = () => {
    console.log("should enter server")
    navigate("/main");
  }

  return (
    <>
      {servers.map((Server, id) => {
        return (
          <StyledGrid container key={id} flexDirection={"row"} onClick={enterServer}>
            <Grid item xs={2.5} md={2} lg={1.5}>
              <StyledAvatar src={Server.logo} />
            </Grid>
            <Grid item xs={9}>
              <h3>{Server.name}</h3>
              <p>{Server.description}</p>
            </Grid>
          </StyledGrid>
        )
      })}
    </>
  )
}

export default MainPageServers;