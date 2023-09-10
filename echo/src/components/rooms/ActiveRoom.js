import OnlineUserIcon from '../user/OnlineUserIcon';

import { ep } from '../../index';
import { useEffect } from 'react';

function ActiveRoom({ users, onClick, data }) {
  const handleClick = () => {
    onClick(data.id);
  }

  useEffect(() => {
    ep.off('userJoinedChannel');
    ep.on("userJoinedChannel", (data) => {
      console.log("userJoinedChannel in ActiveRoom", data)
    });
  }, []);
  
  return (
    <div className='room' onClick={handleClick}>
        <p className='roomName noselect'>{data.name}</p>
        <div className="roomUsers">
            {
              users.map(user => (
                <OnlineUserIcon key={user.name} imgUrl={user.img} name={user.name} id={user.id} />
              ))
            }
        </div>
    </div>
  )
}

export default ActiveRoom