import { Button, ButtonGroup } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react'

const theme = createTheme({
    palette: {
      primary: {main: '#f5e8da',},
      secondary: {main: '#ce8ca5',},
    },
});

const LoginButtons = ({visibility, navigate}) => {
  if(!visibility) return null
  return (
    <ThemeProvider theme={theme}>
      <ButtonGroup
        size='large'
        orientation='vertical'
        disableElevation
        variant="text"
        visibility={!visibility}
        className="loginButtons"
      >
        <Button onClick={() => navigate("/login")}>Login</Button>
        <Button onClick={() => navigate("/register")}>Register</Button>
      </ButtonGroup>
    </ThemeProvider>
  )
}

LoginButtons.defaultProps = {
    visibility: true
}

export default LoginButtons