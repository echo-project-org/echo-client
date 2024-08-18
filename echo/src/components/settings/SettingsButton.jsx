import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip, Button, Typography, Modal, Box, Zoom, Grid } from "@mui/material";
import { useEffect, useState } from 'react';
import { info } from '@lib/logger';
import { ee, ep } from "@root/index";
import SettingsView from './SettingsView';
import StyledComponents from '@root/StylingComponents';

function SettingsButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => {
    info("[SettingsButton] Opening settings modal")
    setModalOpen(true);
  }

  const handleModalClose = () => {
    info("[SettingsButton] Closing settings modal")
    setModalOpen(false);
    ep.setMicrophoneTest(false);
  }

  const handleClick = (event) => {
    handleModalOpen();
  };

  useEffect(() => {
    ee.on("logout", "SettingsButton.logout", () => {
      handleModalClose();
    });

    return () => {
      ee.releaseGroup("SettingsButton.logout");
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
            <SettingsView />
          </StyledComponents.Settings.StyledSettingsBox>
        </Zoom>
      </Modal >
    </>
  )
}

export default SettingsButton