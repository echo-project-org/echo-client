import {
  styled,
  Container,
  Grid,
  Icon,
  Button,
  ButtonGroup,
  Box,
  Avatar,
  Typography,
  TextField
} from '@mui/material';

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
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row-reverse",
    flex: "0 0 auto",
    WebkitAppRegion: "drag"
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

const StyledMainPageGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    ":hover": {
      backgroundColor: theme.palette.background.light,
      cursor: "pointer",
    },
    "h3": {
      color: theme.palette.text.main,
      paddingLeft: ".5rem",
    },
    "p": {
      color: theme.palette.text.main,
      paddingLeft: ".5rem",
    },
  },
}));

const StyledMainPageAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "4rem",
    height: "4rem",
    margin: "1.2rem",
    border: "2px solid " + theme.palette.text.light,
    backgroundColor: theme.palette.background.light,
    "& .MuiSvgIcon-root": {
      fontSize: "2.2rem",
      color: theme.palette.background.dark,
    }
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
    WebkitAppRegion: "none",
  }
}));

/* Main Page Server */

const MainServersListContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflow: "hidden",
    userSelect: "none",
  }
}));

const StyledServerContainer = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flex: "1 1 auto",
  }
}));

const StyledMainPageServersComponent = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    display: "flex",
    justifyContent: "left",
    alignItems: "left",
    padding: "0.5rem",
    fontSize: "0.9rem",
  }
}));

const StyledMainPageServersComponentIcon = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "20rem",
    height: "5rem",
    borderRadius: "5rem",
    gap: "1rem",
    backgroundColor: theme.palette.background.light,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all .1s ease-in-out",
    fontSize: "3rem",
    margin: "1rem 0 0 1rem",
    position: "relative",
    overflow: "hidden",
    ":hover": {
      backgroundColor: theme.palette.background.light,
      // add brightness to the icon
      filter: "brightness(1.2)",
      cursor: "pointer",
    }
  }
}));

const StyledMainPageServersComponentServersList = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  }
}));

/* Rooms & Room */

const StyledRoomsContainer = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    height: "0",
    margin: "0 auto",
    flex: ".94 0 auto",
    display: "flex",
    flexDirection: "column",
    overflowY: "show",
    overflowX: "hidden",
  }
}));

const StyledActiveRoom = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    backgroundColor: theme.palette.background.dark,
    borderRadius: "0 .4rem .4rem 0",
    margin: ".4rem 0 .4rem 0",
    boxShadow: ".3rem 0 .3rem .1rem " + theme.palette.text.light,
    transition: "boxShadow .1s ease-in-out, height 1s ease-in-out",
    marginRight: ".75rem",
    "h6": {
      paddingTop: ".5rem",
      color: theme.palette.text.light
    }
  }
}));

const StyledInactiveRoom = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    backgroundColor: theme.palette.background.dark,
    borderRadius: "0 .3rem .3rem 0",
    margin: ".4rem 0 .4rem 0",
    transition: "all .2s ease-in-out",
    cursor: "pointer",
    marginRight: ".65rem",
    ":hover": {
      boxShadow: ".2rem 0 .3rem .5px " + theme.palette.text.light,
      transition: "boxShadow .2s ease-in-out"
    },
    "h6": {
      paddingTop: ".5rem",
      fontSize: "1.1rem",
      color: theme.palette.text.light
    }
  }
}));

const StyledRoomUsers = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }
}));

const StyledRoomContentHeader = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    // margin: "0 0 0 1rem",
    width: "99%",
    position: "relative",
    display: "inline-flex",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: theme.palette.background.dark,
    // padding: "0 0 0 .6rem",
    maxHeight: "43.09px",
    top: "10%",
  },
}));

const StyledRoomContentItems = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    // margin: ".1rem 0 0 1rem",
    height: "100%",
    width: "99%",
    position: "relative",
    padding: "0",
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "calc(100vw - 20rem)",
    backgroundColor: theme.palette.background.dark,
  },
}));

const StyledRoomTitleContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    padding: ".5rem",
    margin: "auto !important",
    width: "fit-content",
    flexDirection: "row",
    justifyContent: "left",
    textAlign: "left",
    alignItems: "left",
    marginTop: "1rem",
    display: "flex !important",
    color: theme.palette.text.light,
    maxWidth: "20rem !important",
    fontSize: ".8rem",
  }
}));

const StyledRoomDescriptionContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    padding: ".5rem",
    margin: "auto !important",
    width: "fit-content",
    flexDirection: "row",
    justifyContent: "left",
    textAlign: "left",
    alignItems: "left",
    marginTop: "1rem",
    display: "flex !important",
    color: theme.palette.text.light,
    maxWidth: "100% !important",
    fontSize: ".7rem",
  }
}));

/* Room Controls */

const StyledRoomControlsContainer = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    zIndex: 1,
  }
}));

const StyledRoomControlsConnection = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    fontSize: "1rem",
    userSelect: "none",
    cursor: "pointer",
    margin: "0 auto 10px auto",
    height: "auto",
    width: "80%",
    color: "white",
    border: "1px solid " + theme.palette.background.light,
    background: "linear-gradient(200deg, " + theme.palette.secondary.light + " 0%, " + theme.palette.secondary.main + " 20%, " + theme.palette.secondary.dark + " 100%)",
    boxShadow: "0 0 .3rem .1rem " + theme.palette.background.dark,
    borderRadius: "1rem",
    padding: "5px",
    "p": {
      lineHeight: "normal",
      display: "inline",
      verticalAlign: "middle",
    }
  }
}));

/* Settings */

const StyledSettingsContainer = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  }
}));

const StyledSettingsBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "relative",
    top: "5%",
    margin: "auto",
    height: '80%',
    width: '80%',
    backgroundColor: theme.palette.backgroundSolid.main,
    color: theme.palette.text.main,
    overflow: 'auto',
    border: "2px solid " + theme.palette.backgroundSolid.light,
    boxShadow: "24",
    outline: 'none',
    padding: "1.5rem",
    borderRadius: '.4rem',
  }
}));

const StyledSettingsView = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    height: '100%',
    width: '100%',
    backgroundColor: theme.palette.background.main,
    color: theme.palette.text.main,
    overflow: 'auto',
    outline: 'none',
  }
}));

const StyledImageUploaderContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "fixed",
    top: "20%",
    left: "20%",
    textAlign: "center",
    maxWidth: "60%",
    width: "60%",
    height: "fit-content",
    paddingBottom: "1rem",
    paddingTop: "1rem",
    margin: "auto",
    backgroundColor: theme.palette.backgroundSolid.main,
    boxShadow: "0 8px 15px 8px rgba(0, 0, 0, .8)",
    border: "1px solid " + theme.palette.text.light,
    borderRadius: "20px",
    zIndex: "3",
  },
}));

const StyledImageUploaderBackground = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    height: "100%",
    position: "fixed",
    backgroundColor: theme.palette.backgroundSolid.main,
    top: 0,
    left: 0,
    zIndex: 3
  }
}));

const StyledImageUploaderContentContainer = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    backgroundColor: theme.palette.background.dark,
    margin: "1rem 1rem 0 1rem",
    paddingBottom: "1rem",
    borderRadius: "1rem",
  }
}));

const StyledSettingsModalSubdiv = styled("div")(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    backgroundColor: theme.palette.background.dark,
    padding: "1rem",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  }
}));

/* Friends */

const StyledFriendsContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap !important",
    width: "100%",
    padding: ".8rem",
    color: theme.palette.text.primary,
    ":hover": {
      backgroundColor: theme.palette.background.light,
    },
    "& .MuiAvatar-root": {
      width: "calc(2rem + 2vw)",
      height: "calc(2rem + 2vw)",
    },
    "& .MuiGrid-root": {
      display: "flex",
      flexDirection: "column",
      textAlign: "left",
      width: "5rem",
    },
    "& .MuiContainer-root": {
      textAlign: "right"
    },
    "span": {
      fontSize: "calc(0.8rem + 0.5vw)",
      fontWeight: "500",
      paddingLeft: "0.5rem",
    }
  }
}));

const StyledFriendsListContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    height: "100%",
    padding: "0 !important",
    maxWidth: "100% !important",
    overflowY: "auto",
  }
}));

const StyledFriendsListOverflow = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "0 !important",
    maxWidth: "100% !important",
  }
}));

/* OnlineUserIcon */

const StyledOnlineUserIcon = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    display: "flex",
    alignItems: "center",
    margin: ".4rem 0 .4rem .5rem",
    "p": {
      margin: "0 0 0 0.5rem",
      color: theme.palette.text.light
    }
  }
}));

const StyledOnlineUserIconContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    transition: "all .1s ease-in-out",
    width: "95%",
    marginBottom: ".4rem",
    ":hover": {
      transition: "all .1s ease-in-out",
      cursor: "pointer",
      backgroundColor: theme.palette.background.light,
      borderRadius: "8px",
    }
  }
}));

const StyledOnlineUserIconAvatarBadge = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "4rem",
    height: "4rem",
    borderRadius: "50%",
    fontSize: "1.2rem",
    fontWeight: "600",
    margin: "0.8rem",
    "svg": {
      position: "absolute",
      bottom: "0",
      right: "0",
      borderRadius: "50%",
      transform: "translate(25%, 25%)",
      backgroundColor: theme.palette.text.light,
      margin: ".1rem",
    }
  }
}));

/* CurrentStatus */

const StyledCurrentStatusContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
    padding: "0.5rem",
    fontSize: "0.9rem",
  }
}));

/* ScreenShareUserContainer */

const StyledScreenShareUserButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.light,
    borderRadius: "1rem",
    fontSize: "1.3rem",
    padding: ".6rem 1.2rem .6rem 1.2rem",
    gap: ".5rem",
    boxShadow: "0 .3rem .8rem .1rem " + theme.palette.primary.dark,
    transition: "all .2s ease-in-out",
    ":hover": {
      backgroundColor: theme.palette.primary.light,
      boxShadow: "0 .3rem .8rem .1rem " + theme.palette.primary.main,
      color: theme.palette.text.light,
      transition: "all .2s ease-in-out",
    }
  }
}));

const StyledScreenShareAvatar = styled(Avatar)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    // put image in the center of parent div
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "5rem",
    height: "5rem",
  },
}));

const StyledScreenShareTypography = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.palette.text.main,
    opacity: "0.3",
  },
}));

/* ChatControls */

const StyledTextBoxChat = styled(TextField)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    width: "100%",
    backgroundColor: "transparent",
    color: theme.palette.text.light,
    fontSize: "1rem",
    margin: "0",
    padding: "0",
    ":focus": {
      border: "none",
      boxShadow: "none",
    },
    ":hover": {
      border: "none",
      boxShadow: "none",
    },
    "& .MuiInputBase-root": {
      border: "none",
      boxShadow: "none",
      padding: "0 0 0 .4rem",
      ":focus": {
        border: "none",
        boxShadow: "none",
      },
      ":hover": {
        border: "none",
        boxShadow: "none",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
      boxShadow: "none",
      padding: "0",
      ":focus": {
        border: "none",
        boxShadow: "none",
      },
      ":hover": {
        border: "none",
        boxShadow: "none",
      },
    },
  }
}));

export default {
  App: {
    AppStyledContainer,
    StyledTopBar,
  },
  CurrentStatus: {
    StyledCurrentStatusContainer,
  },
  ScreenShare: {
    StyledScreenShareUserButton,
    StyledScreenShareAvatar,
    StyledScreenShareTypography,
  },
  OnlineUserIcon: {
    StyledOnlineUserIconContainer,
    StyledOnlineUserIcon,
    StyledOnlineUserIconAvatarBadge,
  },
  MainPage: {
    StyledMainPageGrid,
    StyledMainPageAvatar,
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
  },
  MainPageServer: {
    MainServersListContainer,
    StyledMainPageServersComponent,
    StyledMainPageServersComponentIcon,
    StyledMainPageServersComponentServersList,
    StyledServerContainer
  },
  Rooms: {
    StyledInactiveRoom,
    StyledActiveRoom,
    StyledRoomUsers,
    StyledRoomsContainer,
    StyledRoomContentHeader,
    StyledRoomContentItems,
    StyledRoomTitleContainer,
    StyledRoomDescriptionContainer,
    StyledTextBoxChat,
  },
  RoomControls: {
    StyledRoomControlsContainer,
    StyledRoomControlsConnection
  },
  Settings: {
    StyledSettingsContainer,
    StyledSettingsBox,
    StyledSettingsView,
    StyledImageUploaderContainer,
    StyledImageUploaderBackground,
    StyledImageUploaderContentContainer,
    StyledSettingsModalSubdiv
  },
  Friends: {
    StyledFriendsContainer,
    StyledFriendsListContainer,
    StyledFriendsListOverflow,
  }
}