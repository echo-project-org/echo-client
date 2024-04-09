import { useState, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Button, Grid, Typography, Zoom, Slider, Stack } from "@mui/material";
import { Search } from '@mui/icons-material';

import { storage, ep } from "@root/index";
import StyledComponents from '@root/StylingComponents';

const api = require("@lib/api");
const { error, log } = require("@lib/logger");

const ImageUploader = ({ open, data }) => {
  const imageEditorRef = useRef(null);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    setZoom(0);
  }, [open]);

  if (!data) data = {};
  if (!data.image) data.image = sessionStorage.getItem("userImage");

  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };

  return (
    <Zoom in={open}>
      <StyledComponents.Settings.StyledImageUploaderBackground>
        <StyledComponents.Settings.StyledImageUploaderContainer>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h3" component="h5" className="noselect">
                Resize image
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <StyledComponents.Settings.StyledImageUploaderContentContainer>
                <Grid container>
                  <Grid item xs={12}>
                    <AvatarEditor
                      className='avatarEditor'
                      ref={imageEditorRef}
                      image={data.image}
                      border={10}
                      borderRadius={300}
                      scale={(zoom / 100) + 1}
                    />
                  </Grid>
                  <Grid item xs={6} className='avatarEditorGrid'>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        const canvas = imageEditorRef.current.getImage().toDataURL();

                        api.call("users/image", "POST", { id: sessionStorage.getItem("id"), image: canvas })
                          .then((res) => {
                            ep.emit("closeUploader");
                            ep.updatePersonalSettings({ id: sessionStorage.getItem("id"), field: "userImage", value: canvas });
                            sessionStorage.setItem("userImage", canvas);
                          })
                          .catch(err => {
                            error(err);
                          });
                      }}
                      sx={{
                        margin: "2rem",
                        width: "80%"
                      }}
                    >
                      Save
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        ep.emit("closeUploader");
                      }}
                      sx={{
                        margin: "2rem",
                        width: "80%"
                      }}  
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <div style={{ width: "80%", margin: "auto" }}>
                      <Stack spacing={2} direction="row" alignItems="center">
                        <Search fontSize="medium" />
                        <Slider
                          sx={{ width: "100%" }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(v) => { return v + "%" }}
                          aria-label="Volume"
                          value={zoom}
                          onChange={handleZoomChange}
                          size='medium'
                        />
                      </Stack>
                    </div>
                  </Grid>
                </Grid>
              </StyledComponents.Settings.StyledImageUploaderContentContainer>
            </Grid>
          </Grid>
        </StyledComponents.Settings.StyledImageUploaderContainer>
      </StyledComponents.Settings.StyledImageUploaderBackground>
    </Zoom>
  )
}

export default ImageUploader;