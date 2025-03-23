import React, { useEffect, useState } from 'react'
import StyledComponents from '@root/StylingComponents';
import { Typography, Grid, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const { ipcRenderer } = window.require('electron');
const { log } = require('@lib/logger');

function Updating({ version = "0.0.0", releaseNotes = "No release notes available" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0);
  const [transferred, setTransferred] = useState(0);
  const [totalToDownload, setTotalToDownload] = useState(0);
  const [downloadPercentage, setDownloadPercentage] = useState(2);
  const [bps, setBps] = useState(0);

  useEffect(() => {
    ipcRenderer.on("downloadProgress", (e, msg) => {
      log(msg)
      setProgress(msg.progress);
      setTransferred(msg.transferred);
      setTotalToDownload(msg.totalToDownload);
      setDownloadPercentage(msg.percent);
      //convert bytes to kilobytes
      setBps(Math.round(msg.bps / 1024));

    });

    return () => {
      ipcRenderer.removeAllListeners("downloadProgress");
    }
  }, [setDownloadPercentage, setBps, navigate, location]);

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

export default Updating