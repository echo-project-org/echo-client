import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { useEffect, useState } from 'react';

import UserSettings from "./UserSettings";
import ThemeSettings from "./ThemeSettings";
import InputDevicesSettings from './InputDevicesSettings';
import OutputDevicesSettings from './OutputDevicesSettings';
import ImageUploader from './ImageUploader';
import ExtraAudioSettings from './ExtraAudioSettings';

import { ep } from "../../index";
import StyledComponents from '../../StylingComponents';

function SettingsButton() {
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [openUploader, setOpenUploader] = useState(false);
  const [uploaderData, setUploaderData] = useState(null);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setOpenUploader(false);
    setModalOpen(false);
    ep.setMicrophoneTest(false);
  }

  const handleClick = (event) => {
    ep.getSpeakerDevices().then((devices) => {
      setOutputDevices(devices)
    })

    ep.getMicrophoneDevices().then((devices) => {
      setInputDevices(devices)
    })

    handleModalOpen();
  };

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
    };
  }, []);

  

  return (
    <>
      <Tooltip title="Settings" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
        <Button onClick={handleClick}>
          <SettingsIcon />
        </Button>
      </Tooltip>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
      >
        <Zoom in={modalOpen}>
          <StyledComponents.Settings.StyledSettingsBox>
            <StyledComponents.Settings.StyledSettingsContainer>
              <Typography variant="h3" className="noselect">
                Echo settings
              </Typography>

              <ImageUploader open={openUploader} data={uploaderData} />

              <Grid container spacing={2}>
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
          </StyledComponents.Settings.StyledSettingsBox>
        </Zoom>
      </Modal>
    </>
  )
}

export default SettingsButton