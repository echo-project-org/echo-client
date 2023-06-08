import '../../index.css'
import { motion } from 'framer-motion'
import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';
import { useState } from 'react';

const MainPage = () => {
    const [roomId, setRoomId] = useState(0);

    const updateCurrentRoom = (joiningId) => {
        console.log("changed room in MainPage", joiningId)
        setRoomId(joiningId);
    }

    return (
        <motion.div
            className='mainScreen'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className='sideWithChat'>
                <Sidebar updateCurrentRoom={updateCurrentRoom}/>
                <RoomContent roomId={roomId} />
            </div>

        </motion.div>
    )
}

MainPage.defaultProps = {
}

export default MainPage