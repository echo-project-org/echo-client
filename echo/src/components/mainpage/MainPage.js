import '../../index.css'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Utilities from '../user/Utilities';
import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';

var api = require('../../api')
var at = require('../../audioTransmitter')

const MainPage = () => {

    const [users, setUsers] = useState(
        [
            {
                "nick": "Undefined",
                "img": "none",
                "stanza": 1,
                "lastIP": "0.0.0.0"
            }
        ]
    );

    const fetchOnlineUsers = async () => {
        api.call('getOnlineUsers')
            .then(async (res) => {
                const data = await res.json();
                setUsers(data);
            });
    }


    useEffect(() => {
        fetchOnlineUsers();
        at.startInputAudioStream();
    }, [])

    return (
        <motion.div
            className='mainScreen'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className='sideWithChat'>
                <Sidebar users={users} />
                <RoomContent />
            </div>

        </motion.div>
    )
}

MainPage.defaultProps = {
}

export default MainPage