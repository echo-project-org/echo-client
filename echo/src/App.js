import './App.css';
import './index.css';

import "./css/wave.css";
import "./css/scrollbar.css";

// import { useEffect } from 'react'
import { HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/mainpage/AnimatedRoutes';
import WindowControls from './components/header/WindowControls';

import {
  createTheme,
  ThemeProvider,
  experimental_extendTheme as extendTheme,
  Experimental_CssVarsProvider as CssVarsProvider,
} from '@mui/material/styles';
// import { ThemeProvider } from '@emotion/react';

const theme = extendTheme({
  palette: {
    background: {
      dark: '#1c111e',
      main: '#2b192e',
      light: '#3e2542',
      lighter: '#502350',
      pink: "#a268ab",
      darkpink: "#805087",
    },
    room: {
      main: "#4d014d",
      light: "#ffccff",
    },
    messages: {
      light: "#ffccdf",
      main: "#fff0fb",
    },
    text: {
      dark: "#2b192e",
      main: "#f5e8da",
      light: "#ffcff8",
    },
    primary: {
      main: '#2b192e',
    },
    secondary: {
      main: '#ce8ca5',
    },
  },
  typography: {
    fontFamily: ['Roboto Condensed'].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.main,
          backgroundColor: theme.palette.primary.main,
          textAlign: "center",
        }),
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: "white",
          fontSize: ".9rem",
          border: "1px solid rgb(235, 144, 235)",
          background: "#3e2542",
          borderRadius: 10,
          padding: 8
        },
        arrow: {
          fontSize: 16,
          width: 17,
          "&::before": {
            border: "1px solid rgb(235, 144, 235)",
            backgroundColor: "#3e2542",
            boxSizing: "border-box"
          }
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          cursor: "e-resize",
          width: "15px",
          height: "15px",
          color: "white",
          ":hover": {
            color: "white",
            boxShadow: "0 0 5px 10px rgba(255, 255, 255, 0.1)"
          }
        },
        valueLabel: {
          backgroundColor: "#3e2542",
          color: "white",
          borderRadius: "10px",
        },
        valueLabelOpen: {
          backgroundColor: "#3e2542",
          color: "white",
          borderRadius: "10px",
        },
        colorPrimary: {
          color: "white",
          // backgroundColor: "white"
        },
        colorSecondary: {
          color: "white",
          // backgroundColor: "white"
        },
        markLabel: {
          color: "white"
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          background: "none"
        },
        paper: {
          borderRadius: '10px',
          background: "none",
          boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)"
        },
        list: {
          borderRadius: '10px',
          boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)"
        }
      },
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          ":hover": {
            backgroundColor: "rgba(0, 0, 0, .1)",
            transitionDuration: ".1s"
          }
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "100%",
          margin: 0,
          padding: 0,
        }
      }
    }
  }
});

function App() {
  // useEffect(() => { });
  
  return (
    <div className="App">
      <CssVarsProvider theme={theme}>
        <div className="topBar">
          <WindowControls/>
        </div>
        <HashRouter>
          <AnimatedRoutes/>
        </HashRouter>
      </CssVarsProvider>
      
      <script src="/socket.io/socket.io.js"></script>
    </div>
  );
}

export default App;
