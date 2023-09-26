import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { useState } from 'react';

import UserSettings from "./UserSettings";
import InputDevicesSettings from './InputDevicesSettings';
import OutputDevicesSettings from './OutputDevicesSettings';

import { ep } from "../../index";

const modalStyle = {
  position: "relative",
  top: "5%",
  margin: "auto",
  height: '80%',
  width: '80%',
  bgcolor: '#4d3352',
  color: '#f5e8da',
  overflow: 'auto',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '.4rem',
};

function SettingsButton() {
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleClick = (event) => {
    ep.getSpeakerDevices().then((devices) => {
      setOutputDevices(devices)
    })

    ep.getMicrophoneDevices().then((devices) => {
      setInputDevices(devices)
    })

    handleModalOpen();
  };

  return (
    <div>
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

              <Grid container spacing={2}>
                <Grid item lg={6} md={12} xs={12}>
                  <InputDevicesSettings inputDevices={inputDevices} />
                </Grid>
                <Grid item lg={6} md={12} xs={12}>
                  <OutputDevicesSettings outputDevices={outputDevices} />
                </Grid>
                <Grid item xs={12}>
                  <UserSettings />
                </Grid>
              </Grid>
            </div>
          </Box>
        </Zoom>
      </Modal>
    </div>
  )
}

export default SettingsButton