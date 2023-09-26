import { Button, ButtonGroup } from '@mui/material'
import React from 'react'

const LoginButtons = ({ visibility, navigate }) => {
  
  if (!visibility) return null;

  return (
    <ButtonGroup
      size='large'
      orientation='vertical'
      disableElevation
      variant="text"
      className="loginButtons"
    >
      <Button onClick={() => navigate("/login")}>Login</Button>
      <Button onClick={() => navigate("/register")}>Register</Button>
    </ButtonGroup>
  )
}

LoginButtons.defaultProps = {
  visibility: true
}

export default LoginButtons