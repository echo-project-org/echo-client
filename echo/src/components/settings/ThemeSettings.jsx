import "@css/settings.css";

import { useState, useEffect } from 'react'
import { Grid, Button, Typography, hexToRgb } from "@mui/material";

import { ee, storage } from "@root/index";
import StyledComponents from '@root/StylingComponents';
import { info } from '@lib/logger';
import { useTheme } from "@emotion/react";

function ThemeSettings() {
  const [background, setBackground] = useState(storage.get("background") || "#331b36");
  const [primary, setPrimary] = useState(storage.get("primary") || "#8f4e9d");
  const [secondary, setSecondary] = useState(storage.get("secondary") || "#d794e0");
  const [text, setText] = useState(storage.get("text") || "#ffffff");
  const [valueChanged, setValueChanged] = useState(false);

  const theme = useTheme();

  const handleChange = (event) => {
    info("[ThemeSettings] Theme changed")
    setValueChanged(true);
    switch (event.target.dataset.type) {
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

  const resetTheme = () => {
    info("[ThemeSettings] Theme reset")
    storage.remove("background");
    storage.remove("primary");
    storage.remove("secondary");
    storage.remove("text");

    setBackground("#331b36");
    setPrimary("#8f4e9d");
    setSecondary("#d794e0");
    setText("#ffffff");

    ee.emit("themeChanged", {
      background: "#331b36",
      primary: "#8f4e9d",
      secondary: "#d794e0",
      text: "#ffffff",
    });
  }

  const updateTheme = () => {
    info("[ThemeSettings] Updating theme")
    storage.set("background", background);
    storage.set("primary", primary);
    storage.set("secondary", secondary);
    storage.set("text", text);

    theme.palette.background.main = hexToRgb(background, 0.5);
    theme.palette.backgroundSolid.main = hexToRgb(background, 1);
    theme.palette.primary.main = primary;
    theme.palette.secondary.main = secondary;
    theme.palette.text.main = text;

    ee.emit("themeChanged", {
      background: background,
      primary: primary,
      secondary: secondary,
      text: text,
    });
  }

  return (
    <StyledComponents.Settings.StyledSettingsModalSubdiv>
      <Typography variant="h6" component="h2" sx={{ width: "95%" }} className="noselect">
        Theme settings
      </Typography>
      <Grid container sx={{ alignItems: "flex-start", justifyContent: "space-around" }}>
        <Grid item xs={12}>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={background} className="input-color" type="color" onChange={handleChange} data-type="background" />
          </div>
          <Typography className="input-color-label noselect">Change background color</Typography>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={primary} className="input-color" type="color" onChange={handleChange} data-type="primary" />
          </div>
          <Typography className="input-color-label noselect">Change primary color</Typography>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={secondary} className="input-color" type="color" onChange={handleChange} data-type="secondary" />
          </div>
          <Typography className="input-color-label noselect">Change secondary color</Typography>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={text} className="input-color" type="color" onChange={handleChange} data-type="text" />
          </div>
          <Typography className="input-color-label noselect">Change text color</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container justifyContent="center" direction={"row"}>
            <Grid item xs={5} sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }}>
              <Button variant="contained" onClick={updateTheme} sx={{ width: "80%" }}>Save Theme</Button>
            </Grid>
            <Grid item xs={5} sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }}>
              <Button variant="contained" onClick={resetTheme} sx={{ width: "80%" }}>Reset Theme</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledComponents.Settings.StyledSettingsModalSubdiv>
  )
}

export default ThemeSettings