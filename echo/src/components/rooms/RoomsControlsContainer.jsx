import { useState, useEffect } from 'react';

import { info } from '@lib/logger';
import { ButtonGroup, Button, Container, Tooltip } from '@mui/material';
import { Add, Edit, Remove, DriveFileRenameOutline } from '@mui/icons-material';

function RoomsControlsContainer({ }) {
  const [edit, setEdit] = useState(false);
  const [hover, setHover] = useState([false, false, false]);

  const handleEdit = () => {
    info("[RoomsControlsContainer] User toggled edit")
    setEdit(!edit)
  }

  return (
    <Container>
      <ButtonGroup
        size="small"
        color="secondary"
        variant='filledTonal'
      >
        <Tooltip title="Edit" arrow disableInteractive>
          <Button
            onClick={handleEdit}
            disableRipple
          ><Edit /></Button>
        </Tooltip>
        <Tooltip title="Create new channel" arrow disableInteractive open={hover[0]}>
          <Button
            disabled={!edit}
            disableRipple
            onMouseEnter={() => setHover([true, false, false])}
            onMouseLeave={() => setHover([false, false, false])}
          ><Add /></Button>
        </Tooltip>
        <Tooltip title="Delete channel" arrow disableInteractive open={hover[1]}>
          <Button
            disabled={!edit}
            disableRipple
            onMouseEnter={() => setHover([false, true, false])}
            onMouseLeave={() => setHover([false, false, false])}
          ><Remove /></Button>
        </Tooltip>
        <Tooltip title="Rename channel" arrow disableInteractive open={hover[2]}>
          <Button
            disabled={!edit}
            disableRipple
            onMouseEnter={() => setHover([false, false, true])}
            onMouseLeave={() => setHover([false, false, false])}
          ><DriveFileRenameOutline /></Button>
        </Tooltip>
      </ButtonGroup>
    </Container>
  )
}

export default RoomsControlsContainer