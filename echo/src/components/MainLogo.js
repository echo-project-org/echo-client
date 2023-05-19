import '../index.css'
import { useState, useEffect } from 'react'
import imgLogo from "../img/headphones.svg"
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom";
import LoadingAnimation from './LoadingAnimation';
import AuthenticatedUserButtons from './AuthenticatedUserButtons';
import LoginButtons from './LoginButtons';

var api = require('../api')

const MainLogo = () => {
    let navigate = useNavigate(); 
    var [loadingVisibility, setLoadingVisibility] = useState(true);
    var [accessBtnVisibility, setAccessBtnVisibility] = useState(false);
    var [loginBtnVisibility, setLoginBtnVisibility] = useState(false);
    var [serverAddress, setServerAddress] = useState('0.0.0.0');
    var [serverPort, setServerPort] = useState('00000');
    var [userNickname, setUserNickname] = useState("undefined");

    var userNickCookie = localStorage.getItem('userNick');

    const goToPage = (page) => {
        navigate(page);
    }

    function timeout(delay) {
        return new Promise( res => setTimeout(res, delay) );
    }

    useEffect(() => {
        const fetchServerSettings = async () => {
            //Getting server audio settings, this also is used to check if the API are responding
            const res = await api.call('getAudioServerAddress');
            const data = await res.json();

            //TODO check if api errors out

            //Saving the audio settings
            setServerAddress(data.address);
            setServerPort(data.port);
            //Hide loading animation
            setLoadingVisibility(false);
            
            if(userNickCookie != null) {
                //If cookies are found then prompt user to access the app
                setAccessBtnVisibility(true);
                setLoginBtnVisibility(false);
                setUserNickname(userNickCookie);
            } else {
                //If no cookies are found then ask for login / registration
                setAccessBtnVisibility(false);
                setLoginBtnVisibility(true);
            }
        }

        fetchServerSettings();
    }, [])

    return (
        <motion.div 
        className='splashScreen'
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        >   
            <div className="logoContainer">
                <img className='mainLogoImg' src={imgLogo} alt='echoLogo'/>
            </div>
            <LoadingAnimation visibility={loadingVisibility}/>
            <LoginButtons visibility={loginBtnVisibility} navigate={goToPage}/>
            <AuthenticatedUserButtons visibility={accessBtnVisibility} nickname={userNickname}/>
        </motion.div>
    )
}

MainLogo.defaultProps = {
}

export default MainLogo