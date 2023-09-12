import OnlineUserIcon from '../user/OnlineUserIcon';

import { useEffect } from 'react';

import { ep } from "../../index";

function ActiveRoom({ users, data }) {
  const handleClick = () => {
    ep.roomClicked({ roomId: data.id });
  }

  return (
    <div className='room' onClick={handleClick}>
      <p className='roomName noselect'>{data.name}</p>
      <div className="roomUsers">
        {
          users.map(user => (
            <OnlineUserIcon key={user.name} imgUrl={user.userImage} name={user.name} id={user.id} />
          ))
        }
      </div>
    </div>
  )
}

export default ActiveRoom