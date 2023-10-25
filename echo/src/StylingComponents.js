import { Container, Grid, Icon, Tooltip, styled, Slide, Button, ButtonGroup } from '@mui/material';

/* App */

const AppStyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    textAlign: "center",
    width: "100vw",
    height: "100vh",
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    top: 0,
    left: 0,
    maxWidth: "100vw !important",
    backgroundColor: theme.palette.background.main,
  }
}));

const StyledTopBar = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    position: "relative",
    width: "100%",
    minHeight: "1.7rem",
    backgroundColor: theme.palette.background.main,
    display: "flex",
    flexDirection: "row-reverse",
    flex: "0 0 auto",
    "-webkit-app-region": "drag"
  }
}));

/* Main Page */

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: 'calc(100vh - 2rem)',
    width: 'calc(100vw - 7rem)',
    marginLeft: ".5rem",
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
    width: '6rem',
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

/* Main Logo */

const StyledImage = styled("img")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "15rem",
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    margin: "auto",
  }
}));

/* Login & Register */

const StyledBoxedLogo = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "5rem",
    width: "5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1.5rem",
    marginLeft: "auto",
    marginRight: "auto",
    animation: "breathingSize 3s ease-out infinite",
    "img": {
      height: "5rem",
      width: "5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "auto",
    }
  }
}));

const StyledRipple = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    left: 0,
    right: 0,
    top: ".2rem",
    position: "absolute",
    borderRadius: "50%",
    width: "5rem",
    height: "5rem",
    margin: "auto",
    /* background-color: red; */
    animation: "breathing 3s ease-out infinite",
  }
}));

const StyledForm = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    backgroundColor: theme.palette.primary.main,
    border: "2px solid #111",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    width: "25rem",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: "auto",
    padding: ".8rem",
    boxShadow: "0 0 5px 1px #111",
    transition: "all .1s ease",
    height: "fit-content",
    ":hover": {
      boxShadow: "0 15px 15px 8px #111",
      transform: "translateY(-5px)",
      transition: "all .1s ease",
    },
    "h1": {
      color: theme.palette.text.light,
      fontSize: "2.2rem"
    },
    "input": {
      marginLeft: "auto",
      marginRight: "auto",
      width: "90%",
      fontSize: "0.875rem",
      fontWeight: "400",
      lineHeight: "1",
      outline: "none",
      padding: ".8rem",
      borderRadius: ".4rem",
      color: theme.palette.text.light,
      background: theme.palette.primary.dark,
      border: "1px solid " + theme.palette.text.light,
      boxShadow: "0px 2px 1px " + theme.palette.text.light,
      transition: "all .2s ease",
      "::placeholder": {
        color: theme.palette.text.light,
      },
      ":focus": {
        transition: "all .2s ease",
        border: "1px solid " + theme.palette.text.light,
        boxShadow: "0px 4px 1px " + theme.palette.text.light,
      },
      ":hover": {
        transition: "all .2s ease",
        border: "1px solid " + theme.palette.text.light,
        boxShadow: "0px 4px 1px " + theme.palette.text.light,
      }
    }
  }
}));

const StyledButtonPrimary = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    border: "1px solid " + theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.dark,
    ":hover": {
      transition: "all .2s ease",
      border: "1px solid " + theme.palette.primary.light,
      // boxShadow: "0px 3px 5px " + theme.palette.primary.light,
      backgroundColor: theme.palette.primary.light,
    }
  }
}));

const StyledButtonSecondary = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    border: "1px solid " + theme.palette.secondary.main,
    backgroundColor: theme.palette.secondary.main,
    ":hover": {
      transition: "all .2s ease",
      border: "1px solid " + theme.palette.secondary.light,
      // boxShadow: "0px 3px 5px " + theme.palette.secondary.light,
      backgroundColor: theme.palette.secondary.light,
    }
  }
}));

/* Window Controls */

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    "-webkit-app-region": "none",
  }
}));

export default {
  App: {
    AppStyledContainer,
    StyledTopBar,
  },
  MainPage: {
    StyledContainer,
    StyledContainerSidebar,
    StyledIconContainer,
    StyledSelectedIcon,
    StyledUnselectedIcon,
  },
  MainLogo: {
    StyledImage,
  },
  Login: {
    StyledRipple,
    StyledBoxedLogo,
    StyledForm,
    StyledButtonPrimary,
    StyledButtonSecondary,
  },
  Register: {
    StyledRipple,
    StyledBoxedLogo,
    StyledForm,
    StyledButtonPrimary,
    StyledButtonSecondary,
  },
  WindowControls: {
    StyledButtonGroup
  }
}