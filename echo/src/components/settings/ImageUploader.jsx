import { useState, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Button, Container, Grid, Zoom, styled } from "@mui/material";

import { storage, ep } from "../../index";

const api = require("../../api");

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    position: "fixed",
    top: "25%",
    left: "25%",
    backgroundColor: "#fff",
    textAlign: "center",
    position: "fixed",
    maxWidth: "50%",
    height: "50%",
    margin: "auto",
    backgroundColor: "var(--mui-palette-background-main)",
    boxShadow: "0 8px 15px 8px rgba(0,0,0,0.8)",
    border: "1px solid var(--mui-palette-text-light)",
    borderRadius: "20px",
    zIndex: "3",
  },
  [theme.breakpoints.up('md')]: {
    position: "fixed",
    top: "20%",
    left: "20%",
    backgroundColor: "#fff",
    textAlign: "center",
    position: "fixed",
    maxWidth: "60%",
    height: "60%",
    margin: "auto",
    backgroundColor: "var(--mui-palette-background-main)",
    boxShadow: "0 8px 15px 8px rgba(0,0,0,0.8)",
    border: "1px solid var(--mui-palette-text-light)",
    borderRadius: "20px",
    zIndex: "3",
  },
  [theme.breakpoints.up('lg')]: {
    position: "fixed",
    top: "20%",
    left: "20%",
    backgroundColor: "#fff",
    textAlign: "center",
    position: "fixed",
    maxWidth: "60%",
    height: "55%",
    margin: "auto",
    backgroundColor: "var(--mui-palette-background-main)",
    boxShadow: "0 8px 15px 8px rgba(0,0,0,0.8)",
    border: "1px solid var(--mui-palette-text-light)",
    borderRadius: "20px",
    zIndex: "3",
  }
}));

const ImageUploader = ({ open, data }) => {
  const imageEditorRef = useRef(null);
  if (!data) data = {};
  if (!data.image) data.image = storage.get("userImage");

  return (
    <Zoom in={open}>
      <div className={open ? "imageUploaderBG bgFadeIn" : "imageUploaderBG"}>
        <StyledContainer>
          <Grid container>
            <Grid item xs={12}>
              <AvatarEditor
                className='avatarEditor'
                ref={imageEditorRef}
                image={data.image}
                border={10}
                borderRadius={300}
                scale={1}
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
          </Grid>
        </StyledContainer>
      </div>
    </Zoom>
  )
}

export default ImageUploader;