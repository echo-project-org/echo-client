import React from 'react'

function LoadingAnimation({ visibility, style }) {
  if (!visibility) return null;
  return (
    <div className={visibility ? 'loadingAnimation notHidden' : 'loadingAnimation hidden'} style={style}>
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
  visibility: false,
  style: {}
}

export default LoadingAnimation