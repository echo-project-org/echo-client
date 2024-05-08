import React from 'react'
import { useEffect, useState } from 'react';
import { Typography, Grid } from "@mui/material";
import { ee } from "@root/index";
import { info } from '@lib/logger';
import UserSettings from "./UserSettings";
import ThemeSettings from "./ThemeSettings";
import InputDevicesSettings from './InputDevicesSettings';
import OutputDevicesSettings from './OutputDevicesSettings';
import ImageUploader from './ImageUploader';
import ExtraAudioSettings from './ExtraAudioSettings';
import StyledComponents from '@root/StylingComponents';
import KeyboardShortcutSettings from './KeyboardShortcutSettings';
import AudiosStreamPlayer from '@lib/mediasoup/AudiosStreamPlayer';
import MicrophoneCapturer from '@lib/mediasoup/MicrophoneCapturer';

function SettingsView() {
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [openUploader, setOpenUploader] = useState(false);
  const [uploaderData, setUploaderData] = useState(null);

  if (inputDevices.length === 0) {
    MicrophoneCapturer.getInputAudioDevices().then((devices) => {
      setInputDevices(devices)
    })
  }

  if (outputDevices.length === 0) {
    AudiosStreamPlayer.getOutputAudioDevices().then((devices) => {
      setOutputDevices(devices)
    })
  }

  useEffect(() => {
    ee.on("openUploader", "SettingsView.openUploader", (data) => {
      info("[SettingsView] Opening image uploader")
      setOpenUploader(true);
      setUploaderData(data);
    });

    ee.on("closeUploader", "SettingsView.closeUploader", () => {
      info("[SettingsView] Closing image uploader")
      setOpenUploader(false);
      setUploaderData(null);
    });

    return () => {
      ee.releaseGroup("SettingsView.openUploader");
      ee.releaseGroup("SettingsView.closeUploader");
      setOpenUploader(false);
    };
  }, []);

  return (
    <StyledComponents.Settings.StyledSettingsContainer>
      <ImageUploader open={openUploader} data={uploaderData} />

      <Grid container spacing={2}>
        <Grid item lg={12} md={12} xs={12}>
          <StyledComponents.Settings.StyledSettingsModalSubdiv>
            <Typography variant="h3" className='noselect'>Echo Settings</Typography>
          </StyledComponents.Settings.StyledSettingsModalSubdiv>
        </Grid>
        <Grid item lg={6} md={12} xs={12}>
          <InputDevicesSettings inputDevices={inputDevices} />
        </Grid>
        <Grid item lg={6} md={12} xs={12}>
          <OutputDevicesSettings outputDevices={outputDevices} />
        </Grid>
        <Grid item xs={12}>
          <ExtraAudioSettings />
        </Grid>
        <Grid item xs={12}>
          <UserSettings />
        </Grid>
        <Grid item xs={12}>
          <ThemeSettings />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <KeyboardShortcutSettings />
      </Grid>

    </StyledComponents.Settings.StyledSettingsContainer>
  )
}

export default SettingsView