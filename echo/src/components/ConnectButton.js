import React from 'react'

const ConnectButton = ({nickname, address, port, visibility, navigate}) => {
  if(!visibility) return null

  const setUserOnline = async () => {
    const res = await fetch('https://timspik.ddns.net/setOnline/'+ nickname +'/T');
    if(res.ok){
      navigate("/main");
    } else {
      console.error("Could not set user as online");
    }
  }
  return (
    <button className='connectButton' role='button' onClick={setUserOnline}>
        Connect to:<br/>
        {address}:{port}<br/>
        as {nickname}
    </button>
  )
}

ConnectButton.defaultProps = {
    address : 'ciaone',
    port: '21',
    visibility: true
}

export default ConnectButton