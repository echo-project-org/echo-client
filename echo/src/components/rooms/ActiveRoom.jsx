import { Typography } from '@mui/material';

import OnlineUserIcon from '../user/OnlineUserIcon';

import { ep } from "../../index";
import StylingComponents from '../../StylingComponents';

function ActiveRoom({ users, data }) {
  return (
    <StylingComponents.Rooms.StyledActiveRoom>
      <Typography variant="h6">{data.name}</Typography>
      <StylingComponents.Rooms.StyledRoomUsers>
        {
          users.sort().map((user, id) => (
            <OnlineUserIcon key={id} user={user} />
          ))
        }
      </StylingComponents.Rooms.StyledRoomUsers>
    </StylingComponents.Rooms.StyledActiveRoom>
  )
}

export default ActiveRoom