import React from 'react'

function LoadingAnimation({visibility}) {
  if(!visibility) return null;
  return (
    <div className={visibility ? 'loadingAnimation notHidden' : 'loadingAnimation hidden'}>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
    </div>
  )
}

LoadingAnimation.defaultProps = {
  visibility: true
}

export default LoadingAnimation