import React from 'react'
import { Avatar, AvatarGroup } from '@mui/material'
import { styled } from "@mui/material/styles";

const StyledAvatarGroup = styled(AvatarGroup)({
    "& .MuiAvatar-root": {
        border: "1px solid #f5e8da"
    },
});

function InactiveRoom({ users }) {
    return (
        <div className='secondRoom'>
            <p className='roomName'>Hello</p>
            <StyledAvatarGroup max={4} sx={{justifyContent: 'flex-end', marginLeft: '.5rem', marginBottom: '.25rem'}}>
                {
                    users.map((user) => (
                        <Avatar alt={users.nick} src={user.img} sx={{ height: '1.25rem', width: '1.25rem' }} />
                    ))
                }
            </StyledAvatarGroup>
        </div>
    )
}

export default InactiveRoom