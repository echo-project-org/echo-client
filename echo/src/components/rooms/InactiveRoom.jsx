import React from 'react'
import { Avatar, AvatarGroup } from '@mui/material'
import { styled } from "@mui/material/styles";

import { ep } from "../../index";

const StyledAvatarGroup = styled(AvatarGroup)({
  "& .MuiAvatar-root": {
    border: "1px solid #f5e8da"
  },
});

function InactiveRoom({ users, data }) {
  const handleClick = () => {
    ep.roomClicked({ roomId: data.id });
  }

  return (
    <div className='secondRoom' onClick={handleClick}>
      <p className='roomName noselect'>{data.name}</p>
      <StyledAvatarGroup max={15} sx={{ justifyContent: 'flex-end', marginLeft: '.5rem', marginBottom: '.25rem' }}>
        {
          users.map((user, id) => (
            <Avatar key={id} alt={users.name} src={user.userImage} sx={{ height: '1.25rem', width: '1.25rem', marginBottom: '.5rem' }} />
          ))
        }
      </StyledAvatarGroup>
    </div>
  )
}

export default InactiveRoom