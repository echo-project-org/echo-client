import './App.css';
import './index.css';

import "./css/form.css";
import "./css/wave.css";
import "./css/scrollbar.css";

import { useEffect, useMemo, useState } from 'react'
import { HashRouter } from "react-router-dom";
import AnimatedRoutes from './components/mainpage/AnimatedRoutes';
import WindowControls from './components/header/WindowControls';

import { storage, ep } from "./index";
import StylingComponents from './StylingComponents';

import {
  createTheme,
  responsiveFontSizes,
  experimental_extendTheme as extendTheme,
  Experimental_CssVarsProvider as CssVarsProvider,
  createMuiTheme,
} from '@mui/material/styles';
// import { ThemeProvider } from '@emotion/react';

function App() {
  const [primary, setPrimary] = useState(storage.get("primary") || "#8f4e9d");
  const [secondary, setSecondary] = useState(storage.get("secondary") || "#d794e0");
  const [text, setText] = useState(storage.get("text") || "#ffffff");
  const [background, setBackground] = useState(storage.get("background") || "#331b36");

  // const theme = useMemo(
  //   () =>
  //     createMuiTheme({
  //       palette: {
  //         primary: { main: primary }
  //       }
  //     }),
  //   [primary]
  // );

  useEffect(() => {
    ep.on("themeChanged", (theme) => {
      console.log(theme);
      setPrimary(() => theme.primary);
      setSecondary(() => theme.secondary);
      setText(() => theme.text);
      setBackground(() => theme.background);
    });

    return () => {
      ep.off("themeChanged");
    }
  }, []);

  const _theme = createTheme();
  const muiTheme = useMemo(
    () => extendTheme({
      palette: {
        mode: 'dark',
        background: _theme.palette.augmentColor({
          color: {
            main: background,
          }
        }),
        text: _theme.palette.augmentColor({
          color: {
            main: text,
          }
        }),
        primary: {
          main: primary,
        },
        secondary: {
          main: secondary,
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
              textAlign: "center",
            }),
            // change the style of the contained button type
            contained: ({ theme }) => ({
              // boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.text.light,
              ":hover": {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.text.light,
                transitionDuration: ".5s"
              },
              "&.Mui-disabled": {
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.text.light,
                boxShadow: "0 .3rem .4rem 0 rgba(0, 0, 0, .5)",
              }
            }),
          }
        },
        MuiAvatar: {
          root: ({ theme }) => ({
            styleOverrides: {
              ".MuiAvatar-fallback": {
                objectFit: "cover",
                background: theme.palette.background.main,
              }
            }
          })
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: ({ theme }) => ({
              color: theme.palette.text.light,
              fontSize: ".9rem",
              border: "1px solid " + theme.palette.background.light,
              backgroundColor: theme.palette.background.main,
              borderRadius: 10,
              padding: 8
            }),
            arrow: ({ theme }) => ({
              fontSize: 16,
              width: 17,
              "::before": {
                border: "1px solid " + theme.palette.background.light,
                backgroundColor: theme.palette.background.main,
                color: theme.palette.background.main,
                boxSizing: "border-box"
              }
            })
          }
        },
        MuiSlider: {
          styleOverrides: {
            thumb: ({ theme }) => ({
              cursor: "e-resize",
              width: "15px",
              height: "15px",
              color: theme.palette.text.light,
              ":hover": ({ theme }) => ({
                color: theme.palette.text.light,
                boxShadow: "0 0 15px 10px " + theme.palette.background.light,
              })
            }),
            valueLabel: ({ theme }) => ({
              backgroundColor: theme.palette.background.main,
              color: theme.palette.text.light,
              borderRadius: "10px",
            }),
            valueLabelOpen: ({ theme }) => ({
              backgroundColor: theme.palette.background.main,
              color: theme.palette.text.light,
              borderRadius: "10px",
            }),
            colorPrimary: ({ theme }) => ({
              color: theme.palette.text.light,
            }),
            colorSecondary: ({ theme }) => ({
              color: theme.palette.text.light,
            }),
            markLabel: ({ theme }) => ({
              color: theme.palette.text.light,
            })
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
              "@media (min-width: 600px)": {
                padding: 0,
              },
              maxWidth: "100% !important",
            }
          }
        },
        MuiToggleButtonGroup: {
          styleOverrides: {
            root: {
              border: "none",
              borderLeft: "none",
            },
            grouped: {
              border: "none",
              borderLeft: "none",
              ":not(:last-of-type)": {
                margin: "0",
                border: "none",
                borderLeft: "none"
              },
              ":not(:first-of-type)": {
                margin: "0",
                border: "none",
                borderLeft: "none"
              },
            },
          }
        },
        MuiToggleButton: {
          styleOverrides: {
            root: ({ theme }) => ({
              color: theme.palette.text.dark,
              backgroundColor: "rgba(0, 0, 0, 0)",
              border: "none",
              ":hover": {
                backgroundColor: "rgba(0, 0, 0, 0)",
                border: "none",
                color: theme.palette.text.dark,
                transitionDuration: ".5s"
              },
              "&.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: "rgba(0, 0, 0, 0)",
                border: "none",
                color: theme.palette.text.light,
                transitionDuration: ".5s"
              },
            }),
          }
        },
      }
    }),
  [primary, secondary, text, background]);
  const responsiveFontTheme = responsiveFontSizes(muiTheme, {
    breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    disableAlign: true,
    factor: 2,
    variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'button', 'overline'],
  });

  return (
    <CssVarsProvider theme={responsiveFontTheme}>
      <StylingComponents.App.AppStyledContainer>
        <StylingComponents.App.StyledTopBar>
          <WindowControls />
        </StylingComponents.App.StyledTopBar>
        <HashRouter>
          <AnimatedRoutes />
        </HashRouter>
      </StylingComponents.App.AppStyledContainer>
    </CssVarsProvider>
  );
}

export default App;
