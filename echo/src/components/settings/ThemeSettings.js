import "../../css/settings.css";

import { useState, useEffect } from 'react'
import { Grid } from "@mui/material";

import { ep, storage } from "../../index";
import { useTheme } from "@emotion/react";

function ThemeSettings() {
  const [background, setBackground] = useState("#331b36");
  const [primary, setPrimary] = useState("#8f4e9d");
  const [secondary, setSecondary] = useState("#d794e0");
  const [text, setText] = useState("#ffffff");

  const theme = useTheme();

  const handleChange = (event) => {
    switch(event.target.dataset.type) {
      case "background":
        setBackground(event.target.value);
        break;
      case "primary":
        setPrimary(event.target.value);
        break;
      case "secondary":
        setSecondary(event.target.value);
        break;
      case "text":
        setText(event.target.value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log("background: " + background)
    theme.palette.background.main = background;
    theme.palette.primary.main = primary;
    theme.palette.secondary.main = secondary;
    theme.palette.text.main = text;
  }, [background, primary, secondary, text]);
    

  return (
    <Grid container className="settingsModalSubDiv">
      <Grid item xs={12}>
        <div sx={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textAlign: "center",
          width: "100%",
        }}>Theme Settings</div>
      </Grid>
      <Grid item xs={2}>
        <div className="input-color-container">
          <input id="input-color" value={background} className="input-color" type="color" onChange={handleChange} data-type="background" />
        </div>
        <div className="input-color-label">Change background color</div>
      </Grid>
      <Grid item xs={2}>
        <div className="input-color-container">
          <input id="input-color" value={primary} className="input-color" type="color" onChange={handleChange} data-type="primary" />
        </div>
        <div className="input-color-label">Change primary color</div>
      </Grid>
      <Grid item xs={2}>
        <div className="input-color-container">
          <input id="input-color" value={secondary} className="input-color" type="color" onChange={handleChange} data-type="secondary" />
        </div>
        <div className="input-color-label">Change secondary color</div>
      </Grid>
      <Grid item xs={2}>
        <div className="input-color-container">
          <input id="input-color" value={text} className="input-color" type="color" onChange={handleChange} data-type="text" />
        </div>
        <div className="input-color-label">Change text color</div>
      </Grid>
    </Grid>
  )
}

export default ThemeSettings