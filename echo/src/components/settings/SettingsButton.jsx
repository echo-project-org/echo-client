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

const modalStyle = {
  position: "relative",
  top: "5%",
  margin: "auto",
  height: '80%',
  width: '80%',
  bgcolor: 'var(--mui-palette-background-main)',
  color: 'var(--mui-palette-text-light)',
  overflow: 'auto',
  border: '2px solid var(--mui-palette-background-light)',
  boxShadow: 24,
  outline: 'none',
  p: 4,
  borderRadius: '.4rem',
};

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
/*     if (ep.getUser(storage.get('id')).currentRoom === '0') {
      console.warn("User must must be in room to change settings");
      return;
    } */

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
          <Box sx={modalStyle}>
            <div className='modalDiv'>
              <Typography variant="h3">
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
            </div>
          </Box>
        </Zoom>
      </Modal>
    </>
  )
}

export default SettingsButton