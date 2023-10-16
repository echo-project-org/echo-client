import { useState, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Button, Container, Grid, Zoom } from "@mui/material";

import { storage, ep } from "../../index";

const api = require("../../api");

const ImageUploader = ({ open, data }) => {
  const imageEditorRef = useRef(null);
  if (!data) data = {};
  if (!data.image) data.image = storage.get("userImage");

  return (
    <Zoom in={open}>
      <Container className='avatarEditorContainer'>
        <Grid container>
          <Grid item xs={12}>
            <AvatarEditor
              ref={imageEditorRef}
              image={data.image}
              width={512}
              height={512}
              border={0}
              borderRadius={300}
              scale={1}
            />
          </Grid>
          <Grid item xs={6}>
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
          <Grid item xs={6}>
            <Button variant="contained" color="primary" onClick={() => {
              ep.emit("closeUploader");
            }}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Zoom>
  )
}

export default ImageUploader;