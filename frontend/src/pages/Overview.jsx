import React from "react";
import overview1 from "../assets/images/Overview/overview1.jpg";

function Overview() {
  return (
    <div className="flex items-center justify-center mt-[92px]">
      <div
        className="md:h-[237px] md:w-[1300px] bg-cover"
        style={{
          backgroundImage: `url(${overview1})`,
          backgroundPosition: "top center", // <-- focus on face (top of image)
        }}
      ></div>
    </div>
  );
}

export default Overview;
