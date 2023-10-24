import { useState, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Button, Container, Grid, Typography, Zoom, styled, Slider, Stack } from "@mui/material";
import { Search } from '@mui/icons-material';

import { storage, ep } from "../../index";

const api = require("../../api");

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "fixed",
    top: "20%",
    left: "20%",
    backgroundColor: "#fff",
    textAlign: "center",
    position: "fixed",
    maxWidth: "60%",
    height: "fit-content",
    paddingBottom: "1rem",
    paddingTop: "1rem",
    margin: "auto",
    backgroundColor: "var(--mui-palette-background-main)",
    boxShadow: "0 8px 15px 8px rgba(0,0,0,0.8)",
    border: "1px solid var(--mui-palette-text-light)",
    borderRadius: "20px",
    zIndex: "3",
  },
}));

const ImageUploader = ({ open, data }) => {
  const imageEditorRef = useRef(null);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    setZoom(0);
  }, [open]);

  if (!data) data = {};
  if (!data.image) data.image = storage.get("userImage");
  
  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };

  return (
    <Zoom in={open}>
      <div className={open ? "imageUploaderBG bgFadeIn" : "imageUploaderBG"}>
        <StyledContainer>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h3" component="h5" className="noselect">
                Resize image
              </Typography>
            </Grid>
            <Grid item xs={12}>
            <div className="imageUploaderContentContainer">
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
                  <Button variant="contained" color="primary" onClick={() => {
                    const canvas = imageEditorRef.current.getImage().toDataURL();

                    api.call("users/image", "POST", { id: storage.get("id"), image: canvas })
                      .then((res) => {
                        ep.emit("closeUploader");
                        ep.updatePersonalSettings({ id: storage.get("id"), field: "userImage", value: canvas });
                        storage.set("userImage", canvas);
                      })
                      .catch(err => {
                        console.error(err);
                      });
                  }}>
                    Save
                  </Button>
                </Grid>
                <Grid item xs={6} className='avatarEditorGrid'>
                  <Button variant="contained" color="primary" onClick={() => {
                    ep.emit("closeUploader");
                  }}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={12} className='avatarEditorGrid'>
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
            </div>
          </Grid>
          </Grid>
        </StyledContainer>
      </div>
    </Zoom>
  )
}

export default ImageUploader;