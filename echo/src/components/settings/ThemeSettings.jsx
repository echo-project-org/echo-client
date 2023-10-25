import "../../css/settings.css";

import { useState, useEffect } from 'react'
import { Grid, Button, Typography } from "@mui/material";

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import { useTheme } from "@emotion/react";

function ThemeSettings() {
  const [background, setBackground] = useState(storage.get("background") || "#331b36");
  const [primary, setPrimary] = useState(storage.get("primary") || "#8f4e9d");
  const [secondary, setSecondary] = useState(storage.get("secondary") || "#d794e0");
  const [text, setText] = useState(storage.get("text") || "#ffffff");
  const [valueChanged, setValueChanged] = useState(false);

  const theme = useTheme();

  const handleChange = (event) => {
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
    storage.remove("background");
    storage.remove("primary");
    storage.remove("secondary");
    storage.remove("text");

    setBackground("#331b36");
    setPrimary("#8f4e9d");
    setSecondary("#d794e0");
    setText("#ffffff");

    ep.emit("themeChanged", {
      background: "#331b36",
      primary: "#8f4e9d",
      secondary: "#d794e0",
      text: "#ffffff",
    });
  }

  const updateTheme = () => {
    storage.set("background", background);
    storage.set("primary", primary);
    storage.set("secondary", secondary);
    storage.set("text", text);

    ep.emit("themeChanged", {
      background: background,
      primary: primary,
      secondary: secondary,
      text: text,
    });
  }

  useEffect(() => {
    theme.palette.background.main = background;
    theme.palette.primary.main = primary;
    theme.palette.secondary.main = secondary;
    theme.palette.text.main = text;
  }, [background, primary, secondary, text]);

  return (
    <StyledComponents.Settings.StyledSettingsModalSubdiv>
      <Grid container sx={{ alignItems: "flex-start", justifyContent: "space-around" }}>
        <Grid item xs={12}>
          <div className="noselect" sx={{
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
          <Typography className="input-color-label">Change background color</Typography>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={primary} className="input-color" type="color" onChange={handleChange} data-type="primary" />
          </div>
          <Typography className="input-color-label">Change primary color</Typography>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={secondary} className="input-color" type="color" onChange={handleChange} data-type="secondary" />
          </div>
          <Typography className="input-color-label">Change secondary color</Typography>
        </Grid>
        <Grid item xs={2}>
          <div className="input-color-container">
            <input id="input-color" value={text} className="input-color" type="color" onChange={handleChange} data-type="text" />
          </div>
          <Typography className="input-color-label">Change text color</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container justifyContent="center" direction={"row"}>
            <Grid item xs={5} sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }}>
              <Button variant="contained" onClick={updateTheme} sx={{ width: "80%" }}>Save</Button>
            </Grid>
            <Grid item xs={5} sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }}>
              <Button variant="contained" onClick={resetTheme} sx={{ width: "80%" }}>Reset</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledComponents.Settings.StyledSettingsModalSubdiv>
  )
}

export default ThemeSettings