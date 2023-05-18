import React from 'react'
import RoomControl from './RoomControl'
import { Button, createTheme, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom';
var api = require('../api')

const theme = createTheme({
  palette: {
    primary: {main: '#f5e8da',},
    secondary: {main: '#ce8ca5',},
  },
});

function Sidebar() {
  let navigate = useNavigate(); 

  const logout = async () => {
    //Notify api
    var nickname = localStorage.getItem("userNick");
    const res = await api.call('setOnline/' + nickname +'/F');
    if(!res.ok){
      console.error("Could not set user as offline");
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("userNick");


    navigate("/");
    
}

  return (
    <div className='sidebar'>
      <RoomControl/>
      <Divider style={{ background: '#f5e8da' }} variant="middle" />
      <Button theme={theme} variant="outlined" onClick={logout}>Logout</Button>
    </div>
  )
}

export default Sidebar