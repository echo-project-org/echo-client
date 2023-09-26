import React from 'react'
import { ArrowBack } from '@mui/icons-material';
import { Button } from '@mui/material'

function BackButton() {
  const goBack = async () => {
    window.history.back();
  }

  return (
    <div className="backButton">
      <Button onClick={goBack}>
        <ArrowBack fontSize="small" />
      </Button>
    </div>
  )
}

export default BackButton