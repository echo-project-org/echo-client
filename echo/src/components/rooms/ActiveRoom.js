import OnlineUserIcon from './OnlineUserIcon'

function ActiveRoom({ users, onClick, data }) {
  const handleClick = () => {
    onClick(data.id);
  }
  
  return (
    <div className='room' onClick={handleClick}>
        <p className='roomName noselect'>{data.name}</p>
        <div className="roomUsers">
            {
              users.map(user => (
                <OnlineUserIcon key={user.name} imgUrl={user.img} name={user.name} />
              ))
            }
        </div>
    </div>
  )
}

export default ActiveRoom