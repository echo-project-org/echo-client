import { useState, useEffect, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Button, Container, Grid } from "@mui/material";

import { storage, ep } from "../../index";

const api = require("../../api");

const ImageUploader = ({ open, data }) => {
  const imageEditorRef = useRef(null);
  if (!open) return null;

  console.log("rendering ComputeImageUploader", open)
  
  // storage.set("userImage", base64);
  // ep.updatePersonalSettings({ id: storage.get("id"), field: "userImage", value: base64 });

  return (
    <Container className='avatarEditorContainer'>
      <Grid container>
        <Grid item xs={12}>
          <AvatarEditor
            ref={imageEditorRef}
            image={data.image || storage.get("userImage")}
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
            storage.set("userImage", canvas);

            api.call("users/image", "POST", { id: storage.get("id"), image: canvas })
              .then((res) => {
                ep.emit("closeUploader");
                ep.updatePersonalSettings({ id: storage.get("id"), field: "userImage", value: canvas });
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
  )
}

export default ImageUploader;