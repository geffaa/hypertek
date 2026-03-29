import React from 'react'
import Buy1 from '../Components/BuyNfa/Buy1'
import GlowingOrb from '../Components/Common/BgColoring'

function BuyNfa() {
  return (
    <div className="flex flex-col items-center px-4 py-10">
      <Buy1 />
      <GlowingOrb Xaxis={910} Yaxis={650}/>
    </div>
  )
}

export default BuyNfa
