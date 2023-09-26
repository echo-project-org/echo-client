import './App.css';
import './index.css';

// import { useEffect } from 'react'
import { HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/mainpage/AnimatedRoutes';
import WindowControls from './components/header/WindowControls';

import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

const theme = createTheme({
  palette: {
    primary: { main: '#f5e8da', },
    secondary: { main: '#ce8ca5', },
  },
  typography: {
    fontFamily: ['Roboto Condensed'].join(','),
  },
  components: {
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
    }
  }
});

function App() {
  // useEffect(() => { });
  
  return (
    <div className="App">
      <ThemeProvider className="appWrapper" theme={theme}>
        <div className="topBar">
          <WindowControls/>
        </div>
        <div className="animatedRoutes">
          <HashRouter>
            <AnimatedRoutes/>
          </HashRouter>
        </div>
      </ThemeProvider>
      
      <script src="/socket.io/socket.io.js"></script>
    </div>
  );
}

export default App;
