import '../index.css'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import OnlineUsers from './OnlineUsers';
import Sidebar from './Sidebar';
var api = require('../api')
var audioTransmitter = require('../audioTransmitter')

const MainPage = () => {

    const [users, setUsers] = useState(
        [
            {
                "nick": "Undefined",
                "img": "https://kurickigabriele2020.altervista.org/Kury.jpg",
                "stanza": 1,
                "lastIP": "0.0.0.0"
            }
        ]
    );
    
    const fetchOnlineUsers = async () => {
        const res = await api.call('getOnlineUsers');
        const data = await res.json();
        setUsers(data);
    }

    const startInputAudioStream = async () => {
        audioTransmitter.startInputAudioStream();
    }

    const stopAudioStream = async () => {
        audioTransmitter.stopAudioStream();
    }

    

    useEffect(() => {   
          fetchOnlineUsers();
          startInputAudioStream();
    }, [])

    return (
        <motion.div 
            className='mainScreen'
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
        >
            <OnlineUsers users={users}/>
            <Sidebar stopAudioStream={stopAudioStream}/>
        </motion.div>
    )
}

MainPage.defaultProps = {
}

export default MainPage