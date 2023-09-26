import { Button, ButtonGroup } from '@mui/material'
import React from 'react'
import { useNavigate } from "react-router-dom";

import { ep, storage } from "../../index";

var api = require('../../api');

const AuthenticatedUserButtons = ({ visibility }) => {
  let navigate = useNavigate();

  const logout = async () => {
    storage.remove("id");
    storage.remove("name");
    storage.remove("email");
    storage.remove("userImage");
    storage.remove("token");
    storage.remove("online");
    storage.remove("refreshToken");
    storage.remove("userImage");

    // EEEEEEEEWWWWWWWWWWWWWWW
    // but why??
    window.location.reload();
  }

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

  if (!visibility) return null;

  return (
    <ButtonGroup
      size='large'
      orientation='vertical'
      disableElevation
      variant="text"
      className="loginButtons"
    >
      <Button onClick={enterServer}>Enter</Button>
      <Button onClick={logout}>Logout</Button>
    </ButtonGroup>
  )
}

AuthenticatedUserButtons.defaultProps = {
  visibility: true,
  nickname: ""
}

export default AuthenticatedUserButtons