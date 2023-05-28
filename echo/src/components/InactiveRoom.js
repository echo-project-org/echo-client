import React from 'react'
import { Avatar, AvatarGroup } from '@mui/material'
import { styled } from "@mui/material/styles";

const StyledAvatarGroup = styled(AvatarGroup)({
    "& .MuiAvatar-root": {
        border: "1px solid #f5e8da"
    },
});

function InactiveRoom({ users, onClick, data}) {
    const handleClick = () => {
      onClick(data.id);
    }

    return (
        <div className='secondRoom' onClick={handleClick}>
            <p className='roomName noselect'>{data.name}</p>
            <StyledAvatarGroup max={4} sx={{justifyContent: 'flex-end', marginLeft: '.5rem', marginBottom: '.25rem'}}>
                {
                    users.map((user) => (
                        <Avatar key={user.id} alt={users.nick} src={user.img} sx={{ height: '1.25rem', width: '1.25rem' }} />
                    ))
                }
            </StyledAvatarGroup>
        </div>
    )
}

export default InactiveRoom