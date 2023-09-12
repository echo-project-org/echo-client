import { useState, useEffect } from 'react'
import imgLogo from "../../img/headphones.svg"
import { motion } from 'framer-motion'
import { useNavigate } from "react-router-dom";
import LoadingAnimation from './LoadingAnimation';
import AuthenticatedUserButtons from '../user/AuthenticatedUserButtons';
import LoginButtons from './LoginButtons';

const MainLogo = () => {
  let navigate = useNavigate();
  const [loadingVisibility, setLoadingVisibility] = useState(true);
  const [accessBtnVisibility, setAccessBtnVisibility] = useState(false);
  const [loginBtnVisibility, setLoginBtnVisibility] = useState(false);
  const [serverAddress, setServerAddress] = useState('0.0.0.0');
  const [serverPort, setServerPort] = useState('00000');

  const goToPage = (page) => {
    navigate(page);
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  useEffect(() => {
    //Getting server audio settings, this also is used to check if the API are responding
    // api.call('app/settings')
    //     .then(async (res) => {
    //         const data = await res.json();

    //         //TODO check if api errors out

    //         //Saving the audio settings
    //         setServerAddress(data.address);
    //         setServerPort(data.port);
    //         //Hide loading animation
    //         setLoadingVisibility(false);

    //         if(userNickCookie != null) {
    //             //If cookies are found then prompt user to access the app
    //             setAccessBtnVisibility(true);
    //             setLoginBtnVisibility(false);
    //             setUserNickname(userNickCookie);
    //         } else {
    //             //If no cookies are found then ask for login / registration
    //             setAccessBtnVisibility(false);
    //             setLoginBtnVisibility(true);
    //         }
    //     });

    // cause it's cool :3
    setLoadingVisibility(true);
    setTimeout(() => {
      setLoadingVisibility(false);
      if (localStorage.getItem('id')) {
        //If cookies are found then prompt user to access the app
        setAccessBtnVisibility(true);
        setLoginBtnVisibility(false);
      } else {
        //If no cookies are found then ask for login / registration
        setAccessBtnVisibility(false);
        setLoginBtnVisibility(true);
      }
    }, Math.random() * 2400);

  }, [])

  return (
    <motion.div
      className='splashScreen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="logoContainer">
        <img className='mainLogoImg' src={imgLogo} alt='echoLogo' />
      </div>
      <LoadingAnimation visibility={loadingVisibility} style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: "auto",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "28rem",
        heigth: "5rem"
      }}
      />
      <LoginButtons visibility={loginBtnVisibility} navigate={goToPage} />
      <AuthenticatedUserButtons visibility={accessBtnVisibility} />
    </motion.div>
  )
}

MainLogo.defaultProps = {
}

export default MainLogo