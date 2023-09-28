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

const _theme = createTheme();

const theme = extendTheme({
  palette: {
    background: _theme.palette.augmentColor({
      color: {
        main: '#331b36',
        contrastText: '#ce91d7',
      }
    }),
    text: _theme.palette.augmentColor({
      color: {
        main: "#f9d1ff",
      }
    }),
    primary: {
      main: '#e6c6eb',
      contrastText: '#ce91d7',
    },
    secondary: {
      main: '#d794e0',
      contrastText: '#ce91d7',
    },
    // accent: 633f69
  },
  typography: {
    fontFamily: ['Roboto Condensed'].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.main,
          backgroundColor: theme.palette.background.main,
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
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--mui-palette-background-dark)",
          color: "var(--mui-palette-text-main)",
          ":hover": {
            color: "var(--mui-palette-text-main)",
            backgroundColor: "rgba(0, 0, 0, .1)",
            transitionDuration: ".5s"
          },
          "&& .Mui-selected": {
            backgroundColor: "var(--mui-palette-background-dark)",
            color: "var(--mui-palette-text-main)",
          },
        },
      }
    },
    // MuiButtonGroup: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: '10px',
    //       boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)",
    //     }
    //   }
    // },
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
