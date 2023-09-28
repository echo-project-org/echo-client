import "../../css/settings.css";

import { useState, useEffect } from 'react'
import { Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { ep, storage } from "../../index";
import { useTheme } from "@emotion/react";

function ThemeSettings() {
  const [background, setBackground] = useState(storage.get("background") || "#331b36");
  const [primary, setPrimary] = useState(storage.get("primary") || "#8f4e9d");
  const [secondary, setSecondary] = useState(storage.get("secondary") || "#d794e0");
  const [text, setText] = useState(storage.get("text") || "#ffffff");

  const theme = useTheme();
  const navigate = useNavigate();

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

  const resetTheme = () => {
    storage.remove("background");
    storage.remove("primary");
    storage.remove("secondary");
    storage.remove("text");

    navigate("/");
    window.location.reload();
  }

  const updateTheme = () => {
    storage.set("background", background);
    storage.set("primary", primary);
    storage.set("secondary", secondary);
    storage.set("text", text);

    navigate("/");
    window.location.reload();
  }

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
      <Grid item xs={12}>
        <Grid container justifyContent="center" direction={"row"}>
          <Grid item xs={5} sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }}>
            <Button variant="outlined" onClick={updateTheme} sx={{ width: "80%" }}>Save</Button>
          </Grid>
          <Grid item xs={5} sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "1rem" }}>
            <Button variant="outlined" onClick={resetTheme} sx={{ width: "80%" }}>Reset</Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ThemeSettings