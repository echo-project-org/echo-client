import './App.css';
import './index.css';

import "./css/form.css";
import "./css/wave.css";
import "./css/scrollbar.css";

// import { useEffect } from 'react'
import { HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/mainpage/AnimatedRoutes';
import WindowControls from './components/header/WindowControls';

import { storage } from "./index";

import {
  createTheme,
  ThemeProvider,
  experimental_extendTheme as extendTheme,
  Experimental_CssVarsProvider as CssVarsProvider,
} from '@mui/material/styles';
// import { ThemeProvider } from '@emotion/react';

function App() {
  const _theme = createTheme();
  const theme = extendTheme({
    palette: {
      mode: 'dark',
      background: _theme.palette.augmentColor({
        color: {
          main: storage.get("background") || '#331b36',
        }
      }),
      text: _theme.palette.augmentColor({
        color: {
          main: storage.get("text") || "#ffffff",
        }
      }),
      primary: {
        main: storage.get("primary") || '#8f4e9d',
      },
      secondary: {
        main: storage.get("secondary") || '#F4A9FE',
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
            backgroundColor: theme.palette.primary.main,
            textAlign: "center",
          }),
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            color: "var(--mui-palette-text-light)",
            fontSize: ".9rem",
            border: "1px solid var(--mui-palette-background-light)",
            background: "var(--mui-palette-background-main)",
            borderRadius: 10,
            padding: 8
          },
          arrow: {
            fontSize: 16,
            width: 17,
            "&::before": {
              border: "1px solid var(--mui-palette-background-light)",
              backgroundColor: "var(--mui-palette-background-main)",
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
            color: "var(--mui-palette-text-light)",
            ":hover": {
              color: "var(--mui-palette-text-light)",
              boxShadow: "0 0 15px 10px var(--mui-palette-background-light)",
            }
          },
          valueLabel: {
            backgroundColor: "var(--mui-palette-background-main)",
            color: "var(--mui-palette-text-light)",
            borderRadius: "10px",
          },
          valueLabelOpen: {
            backgroundColor: "var(--mui-palette-background-main)",
            color: "var(--mui-palette-text-light)",
            borderRadius: "10px",
          },
          colorPrimary: {
            color: "var(--mui-palette-text-light)",
          },
          colorSecondary: {
            color: "var(--mui-palette-text-light)",
          },
          markLabel: {
            color: "var(--mui-palette-text-light)",
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
            color: "var(--mui-palette-text-dark)",
            backgroundColor: "rgba(0, 0, 0, 0)",
            border: "none",
            ":hover": {
              backgroundColor: "rgba(0, 0, 0, 0)",
              border: "none",
              color: "var(--mui-palette-text-dark)",
              transitionDuration: ".5s"
            },
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor: "rgba(0, 0, 0, 0)",
              border: "none",
              color: "var(--mui-palette-text-light)",
              transitionDuration: ".5s"
            },
          },
        }
      },
    }
  });

  return (
    <div className="App">
      <CssVarsProvider theme={theme}>
        <div className="topBar">
          <WindowControls />
        </div>
        <HashRouter>
          <AnimatedRoutes />
        </HashRouter>
      </CssVarsProvider>

      <script src="/socket.io/socket.io.js"></script>
    </div>
  );
}

export default App;
