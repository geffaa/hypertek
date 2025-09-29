import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

function Success() {
  return (
    <div className="flex justify-center items-center mt-24">
      <div className="relative w-24 h-24">
        {/* SVG with stroke-dasharray for gaps - gap at top-right */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="black" 
            strokeWidth="8" 
            fill="none"
            strokeDasharray="282, 40"
            strokeLinecap="round"
            strokeDashoffset="70"
          />
        </svg>
        
        {/* Check icon at top-right corner where there's no border */}
        <div className="absolute -top-2 -right-1 rounded-full p-1">
          <FontAwesomeIcon icon={faCheck} className="text-green-500 h-16 w-16" />
        </div>
      </div>
    </div>
  );
}

export default Success;