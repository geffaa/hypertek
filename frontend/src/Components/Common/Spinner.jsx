import React from "react";

const FullScreenLoader = ({ size = 3, color = "white" }) => { // default size smaller
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999] pointer-events-auto">
      <div
        className="animate-spin rounded-full border-4 border-t-transparent border-b-transparent"
        style={{
          width: `${size}rem`,
          height: `${size}rem`,
          borderColor: color,
          borderTopColor: "transparent",
        }}
      ></div>
    </div>
  );
};

export default FullScreenLoader;
