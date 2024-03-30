import React from 'react'
import StyledComponents from '@root/StylingComponents';
import { Typography, Grid, CircularProgress } from "@mui/material";
function Updating({ version, releaseNotes, downloadPercentage, bps }) {
    return (
        <StyledComponents.Settings.StyledSettingsView>
            <StyledComponents.Settings.StyledSettingsContainer>
                <Grid container spacing={2}>
                    <Grid item lg={12} md={12} xs={12}>
                        <StyledComponents.Settings.StyledSettingsModalSubdiv>
                            <Typography variant="h3" className='noselect'>Version {version} available!</Typography>
                            <Typography variant="body1" className='noselect'>The app will download the update and restart</Typography>
                            <Typography variant="h4" className='noselect'>Patch notes:</Typography>
                            <Typography variant="body1" className='noselect'>{releaseNotes}</Typography>
                        </StyledComponents.Settings.StyledSettingsModalSubdiv>
                    </Grid>
                    <Grid item lg={12} md={12} xs={12}>
                        <StyledComponents.Settings.StyledSettingsModalSubdiv>
                            {downloadPercentage > 0 ? (
                                <>
                                    <Typography variant="h4" className='noselect'>Downloading update</Typography>
                                    <CircularProgress variant="determinate" value={downloadPercentage} />
                                    <Typography variant="body1" className='noselect'>{bps} KB/s</Typography>
                                </>) : (
                                <>
                                    <Typography variant="h4" className='noselect'>Preparing update</Typography>
                                    <CircularProgress />
                                </>
                            )}
                        </StyledComponents.Settings.StyledSettingsModalSubdiv>
                    </Grid>
                </Grid>
            </StyledComponents.Settings.StyledSettingsContainer>
        </StyledComponents.Settings.StyledSettingsView>

    )
}

Updating.defaultProps = {
    version: "0.0.0",
    releaseNotes: "No release notes available",
    downloadPercentage: 0,
    bps: 0
}

export default Updating