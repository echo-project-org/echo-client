import '../../index.css'
import { motion } from 'framer-motion'
import Sidebar from '../sidebar/Sidebar';
import RoomContent from '../rooms/RoomContent';

const MainPage = () => {
    return (
        <motion.div
            className='mainScreen'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className='sideWithChat'>
                <Sidebar />
                <RoomContent />
            </div>

        </motion.div>
    )
}

MainPage.defaultProps = {
}

export default MainPage