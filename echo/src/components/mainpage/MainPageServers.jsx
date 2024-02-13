import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { TransitionGroup } from 'react-transition-group';

import { ep, storage } from "../../index";
import MainPageServersComponent from './MainPageServersComponent';

const api = require('../../api');

function MainPageServers({ }) {
  const [servers, setServers] = useState([]);
  const navigate = useNavigate();

  const updateServers = () => {
    api.call('servers/')
      .then((res) => {
        setServers(res.json);
      })
      .catch((err) => {
        console.error(err.message);
      });
  
  }

  useEffect(() => {
    updateServers();
  }, []);
  

  const enterServer = async (serverId) => {
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
          MainPageServersComponent({ Server, id, enterServer })
        )
      })}
    </TransitionGroup>
  )
}

export default MainPageServers;