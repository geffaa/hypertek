import React from 'react'
import GlowingOrb from '../Components/Common/BgColoring'

function Testing() {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background Orb */}
      <GlowingOrb Yaxis={200} Xaxis={180} />

      {/* Foreground Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-white text-4xl font-bold">
          Hello world, this is the example
        </h1>
      </div>
    </div>
  )
}

export default Testing
