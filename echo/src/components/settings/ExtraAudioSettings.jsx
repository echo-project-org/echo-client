import { useState, useEffect } from 'react'
import { Stack, Slider, Tooltip, FormControlLabel, Switch, Typography } from '@mui/material';
import { RecordVoiceOver, Headphones } from '@mui/icons-material';
import { info } from '@lib/logger';
import { storage, ee, ep, ap } from "@root/index";
import StyledComponents from '@root/StylingComponents';

function ExtraAudioSettings() {
  const [echoCancellation, setEchoCancellation] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [micTest, setMicTest] = useState(false);
  const [vadTreshold, setVadTreshold] = useState(0);
  const [soundQueuesVolume, setSoundQueuesVolume] = useState(60);

  useEffect(() => {
    ep.setVadTreshold(storage.get('vadTreshold') || 1);
    //ep.setMicrophoneTest(false);
    ep.setEchoCancellation(storage.get('echoCancellation') === 'true' || false);
    ep.setNoiseSuppression(storage.get('noiseSuppression') === 'true' || false);
    ep.setAutoGainControl(storage.get('autoGainControl') === 'true' || false);
    setVadTreshold(Math.floor(storage.get('vadTreshold') * 100) || 0);
    setMicTest(false);
    setEchoCancellation(storage.get('echoCancellation') === 'true' || false);
    setNoiseSuppression(storage.get('noiseSuppression') === 'true' || false);
    setAutoGainControl(storage.get('autoGainControl') === 'true' || false);
    setSoundQueuesVolume(Math.floor(storage.get('soundQueuesVolume') * 100) || 60);
    ap.setVolume(storage.get('soundQueuesVolume') || 0.6);

    return () => {
      //ep.setMicrophoneTest(false);
    }
  }, [])

  const handleVadTresholdChange = (event, newValue) => {
    info("[ExtraAudioSettings] Vad treshold setting change " + newValue)
    storage.set('vadTreshold', newValue / 100);
    setVadTreshold(newValue);
    ep.setVadTreshold(newValue / 100);
  };

  const handleTestChange = (event) => {
    info("[ExtraAudioSettings] Test setting change " + event.target.checked)
    setMicTest(event.target.checked);
    ep.setMicrophoneTest(event.target.checked);
  };

  const handleEchoCancellationChange = (event) => {
    info("[ExtraAudioSettings] Echo cancellation setting change " + event.target.checked)
    setEchoCancellation(event.target.checked);
    ep.setEchoCancellation(event.target.checked);
    storage.set('echoCancellation', event.target.checked);
  };

  const handleNoiseSuppressionChange = (event) => {
    info("[ExtraAudioSettings] Noise suppression setting change " + event.target.checked)
    setNoiseSuppression(event.target.checked);
    ep.setNoiseSuppression(event.target.checked);
    storage.set('noiseSuppression', event.target.checked);
  };

  const handleAutoGainControlChange = (event) => {
    info("[ExtraAudioSettings] Auto gain control setting change " + event.target.checked)
    setAutoGainControl(event.target.checked);
    ep.setAutoGainControl(event.target.checked);
    storage.set('autoGainControl', event.target.checked);
  };

  const handleSoundQueuesVolumeChange = (event, newValue) => {
    info("[ExtraAudioSettings] Sound queues volume setting change " + newValue)
    storage.set('soundQueuesVolume', newValue / 100);
    setSoundQueuesVolume(newValue);
    ap.setVolume(newValue / 100);
  }

  return (
    <StyledComponents.Settings.StyledSettingsModalSubdiv>
      <Typography variant="h6" component="h2" sx={{ width: "95%" }} className="noselect">
        Extra audio settings
      </Typography>
      <div style={{ width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip title="Voice activity detection" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <RecordVoiceOver fontSize="medium" />
          </Tooltip>
          <Slider
            sx={{ width: "100%" }}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => { return v + "%" }}
            aria-label="Volume"
            value={vadTreshold}
            onChange={handleVadTresholdChange}
            size='medium'
          />
        </Stack>
      </div>
      <div style={{ width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip title="Sound queues volume" placement="top" arrow enterDelay={1} enterTouchDelay={20}>
            <Headphones fontSize="medium" />
          </Tooltip>
          <Slider
            sx={{ width: "100%" }}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => { return v + "%" }}
            aria-label="Volume"
            value={soundQueuesVolume}
            onChange={handleSoundQueuesVolumeChange}
            size='medium'
          />
        </Stack>
      </div>
      <div style={{ paddingRight: "2%", width: "95%" }}>
        <Stack spacing={2} direction="row" alignItems={"center"} justifyContent={"space-between"}>
          <FormControlLabel className="noselect" control={<Switch checked={micTest} onChange={handleTestChange} />} label="Test your input device" />
          <FormControlLabel className="noselect" control={<Switch checked={echoCancellation} onChange={handleEchoCancellationChange} />} label="Echo cancellation" />
          <FormControlLabel className="noselect" control={<Switch checked={noiseSuppression} onChange={handleNoiseSuppressionChange} />} label="Noise suppression" />
          <FormControlLabel className="noselect" control={<Switch checked={autoGainControl} onChange={handleAutoGainControlChange} />} label="Auto gain control" />
        </Stack>
      </div>
    </StyledComponents.Settings.StyledSettingsModalSubdiv>
  )
}

export default ExtraAudioSettings;