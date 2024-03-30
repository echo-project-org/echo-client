import { Typography } from '@mui/material';

import OnlineUserIcon from '@components/user/OnlineUserIcon';

import { ep } from "@root/index";
import StylingComponents from '@root/StylingComponents';

function ActiveRoom({ users, data }) {
  return (
    <StylingComponents.Rooms.StyledActiveRoom>
      <Typography variant="h6" className='noselect'>{data.name}</Typography>
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