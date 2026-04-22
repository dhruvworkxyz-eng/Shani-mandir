import React from 'react'
import templeVideo from "../images/TempleVideo2.mp4";

const VideoPage = () => {
  return (
    <div className="h-[55vh] overflow-hidden">
  <video
    className="w-full h-full object-cover"
    src={templeVideo}
    autoPlay
    loop
    muted
  />
</div>
  )
}

export default VideoPage

