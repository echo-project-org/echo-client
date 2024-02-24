import React from 'react'
import { useEffect, useState } from 'react';
import { Typography, Grid } from "@mui/material";
import { ep } from "../../index";

import UserSettings from "./UserSettings";
import ThemeSettings from "./ThemeSettings";
import InputDevicesSettings from './InputDevicesSettings';
import OutputDevicesSettings from './OutputDevicesSettings';
import ImageUploader from './ImageUploader';
import ExtraAudioSettings from './ExtraAudioSettings';
import StyledComponents from '../../StylingComponents';

function SettingsView() {
    const [inputDevices, setInputDevices] = useState([]);
    const [outputDevices, setOutputDevices] = useState([]);
    const [openUploader, setOpenUploader] = useState(false);
    const [uploaderData, setUploaderData] = useState(null);

    if (inputDevices.length === 0) {
        ep.getMicrophoneDevices().then((devices) => {
            setInputDevices(devices)
        })
    }

    if (outputDevices.length === 0) {
        ep.getSpeakerDevices().then((devices) => {
            setOutputDevices(devices)
        })
    }

    useEffect(() => {
        ep.on("openUploader", (data) => {
            setOpenUploader(true);
            setUploaderData(data);
        });
        ep.on("closeUploader", () => {
            setOpenUploader(false);
            setUploaderData(null);
        });

        return () => {
            ep.off("openUploader");
            ep.off("closeUploader");
            setOpenUploader(false);
        };
    });

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
        </StyledComponents.Settings.StyledSettingsContainer>
    )
}

export default SettingsView