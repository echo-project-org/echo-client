import React from 'react'

function LoadingAnimation({ visibility = false, style = {} }) {
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

export default LoadingAnimation