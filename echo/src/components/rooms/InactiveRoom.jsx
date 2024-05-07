import React from 'react'
import { Avatar, AvatarGroup, Typography } from '@mui/material'
import { styled } from "@mui/material/styles";

import { info } from "@lib/logger";
import StylingComponents from '@root/StylingComponents';

const StyledAvatarGroup = styled(AvatarGroup)({
  "& .MuiAvatar-root": {
    border: "1px solid #f5e8da"
  },
});

function InactiveRoom({ users, data }) {
  const handleClick = () => {
    info("[InactiveRoom] Room clicked");
    //TODO ep.checkRoomClicked({ roomId: data.id });
  }

  return (
    <StylingComponents.Rooms.StyledInactiveRoom onClick={handleClick}>
      <Typography variant="h6" className='noselect'>{data.name}</Typography>
      <StyledAvatarGroup max={15} sx={{ justifyContent: 'flex-end', marginLeft: '.5rem', marginBottom: '.25rem' }}>
        {
          users.map((user, id) => (
            <Avatar key={id} alt={users.name} src={user.userImage} sx={{ height: '1.25rem', width: '1.25rem', marginBottom: '.5rem' }} />
          ))
        }
      </StyledAvatarGroup>
    </StylingComponents.Rooms.StyledInactiveRoom>
  )
}

export default InactiveRoom