import "@css/settings.css";

import { useState, useEffect } from 'react'
import { Grid, ClickAwayListener, Typography } from "@mui/material";
import { Mic, ArrowDropDown, ArrowDropUp, CheckCircle } from '@mui/icons-material';

import StyledComponents from '@root/StylingComponents';

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
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="body1" component="p" sx={{ width: "95%" }} className="noselect">
                        Toggle mute
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" component="p" sx={{ width: "95%" }} className="noselect">
                        Toggle deafen
                    </Typography>
                </Grid>
            </Grid>
        </StyledComponents.Settings.StyledSettingsModalSubdiv>
    )
}

export default KeyboardShortcutSettings