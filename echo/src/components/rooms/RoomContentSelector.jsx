import React from 'react'
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ChatBubble, PeopleAlt, Window } from '@mui/icons-material';

function RoomContentSelector({ roomId, contentSelected, setContentSelected}) {
    const control = {
        value: contentSelected,
        exclusive: true,
        onChange: (event, newAlignment) => {
            if(newAlignment === null) return;
            setContentSelected(newAlignment)
        },
    }
    if (String(roomId) === '0') {
        return (
            <ToggleButtonGroup>
                <ToggleButton value="friends" key="friends" disableRipple>
                    <PeopleAlt />
                </ToggleButton>
            </ToggleButtonGroup>
        )
    }
    return (
        <ToggleButtonGroup size="small" {...control} aria-label="Small sizes">
            <ToggleButton value="friends" key="friends" disableRipple>
                <PeopleAlt />
            </ToggleButton>,
            <ToggleButton value="chat" key="chat" disableRipple>
                <ChatBubble />
            </ToggleButton>,
            <ToggleButton value="screen" key="screen" disableRipple>
                <Window />
            </ToggleButton>
        </ToggleButtonGroup>
    )
}

export default RoomContentSelector