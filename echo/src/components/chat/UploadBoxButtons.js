import React from 'react'
import { Button, ButtonGroup, InputAdornment } from '@mui/material'
import { AddCircle } from '@mui/icons-material';
import { useTheme } from '@emotion/react';

function UploadBoxButtons({ onClick }) {
  const theme = useTheme();
  const buttonStyle = {
    color: theme.palette.text.main,
    backgroundColor: theme.palette.background.dark,
    textAlign: "center",
  }

  return (
    <InputAdornment position="end">
      <ButtonGroup variant='text'>
        <Button sx={buttonStyle}>
          <AddCircle onClick={onClick} />
        </Button>
      </ButtonGroup>
    </InputAdornment>
  )
}

export default UploadBoxButtons