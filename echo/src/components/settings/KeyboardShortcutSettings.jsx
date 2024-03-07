import "../../css/settings.css";

import { useState, useEffect } from 'react'
import { Grid, ClickAwayListener, Typography } from "@mui/material";
import { Mic, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';

import { ep, storage } from "../../index";
import StyledComponents from '../../StylingComponents';

import { useTheme } from "@emotion/react";

function KeyboardShortcutSettings() {
    const [showList, setShowList] = useState(false);

    const shortcutListToggle = (status = true) => {
        setShowList(status);
    }

    const shortcutActions = [
        {
            displayName: "Toggle Mute",
            actionName: "toggleMute",
        }, {
            displayName: "Toggle Deafen",
            actionName: "toggleDeaf",
        }
    ]

    return (
        <StyledComponents.Settings.StyledSettingsModalSubdiv>
            <Typography variant="h6" component="h2" sx={{ width: "95%" }} className="noselect">
                Keyboard shortcuts
            </Typography>
            <Grid container sx={{ alignItems: "flex-start", justifyContent: "space-around" }}>
        
            </Grid>
        </StyledComponents.Settings.StyledSettingsModalSubdiv>
    )
}

export default KeyboardShortcutSettings