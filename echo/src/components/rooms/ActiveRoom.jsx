import OnlineUserIcon from '../user/OnlineUserIcon';

import { ep } from "../../index";

function ActiveRoom({ users, data }) {
  // const handleClick = () => {
  //   ep.roomClicked({ roomId: data.id });
  // }

  return (
    // <div className='room' onClick={handleClick}>
    <div className='room'>
      <p className='roomName noselect'>{data.name}</p>
      <div className="roomUsers">
        {
          users.sort().map((user, id) => (
            <OnlineUserIcon key={id} user={user} />
          ))
        }
      </div>
    </div>
  )
}

export default ActiveRoom