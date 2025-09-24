import React from "react";
import popularCollections from '../../assets/images/popular/popolar.png';
import TVector  from '../../assets/images/popular/vector.png';
import BuyNow  from '../../assets/images/popular/buynow.png';

function PopularCollections() {
  return (
    <section
      className="flex flex-col gap-6 w-full px-4 sm:px-8 md:px-16 py-12"
      style={{ minHeight: "621px" }}
    >
      {/* Heading */}
      <div className="flex flex-col gap-4 items-start ml-0 sm:ml-12 max-w-full">
        <h1
          className="text-white uppercase text-2xl sm:text-3xl lg:text-[30px]"
          style={{
            fontFamily: "Goldman",
            fontWeight: 700,
            lineHeight: "100%",
            letterSpacing: "0%",
          }}
        >
          Popular Collections
        </h1>

        {/* Decorative underline bars */}
        <div className="flex gap-2">
          <div className="h-[3px] w-12 bg-white"></div>
          <div className="h-[3px] w-20 bg-white"></div>
          <div className="h-[3px] w-8 bg-white"></div>
          <div className="h-[3px] w-40 bg-gradient-to-r from-white to-transparent"></div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="flex gap-6 flex-wrap md:flex-nowrap justify-center">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg shadow-md text-white p-4 flex-shrink-0"
            style={{
              width: "100%",
              maxWidth: "305px",
              height: "auto",
            }}
          >
            {/* Image container */}
            <div
              className="w-full h-[160px] overflow-hidden rounded-[19px] mb-4"
              style={{
                background: "linear-gradient(to right, #9b926dff, #fde68a, #fcd34d)"
              }}
            >
              <img
                src={popularCollections}
                alt="Collection"
                className="w-full h-full object-cover object-top" // focus on top (face/chest)
                style={{ transform: "scaleX(-1)" }}
              />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold mb-2">Monkey Ape</h2>

            {/* Info Row */}
            <div className="flex justify-between items-center mb-4 mt-5">
              <h3 className="text-sm font-semibold">No33 🔥</h3>
              <div className="flex items-center">
                <img
                  src={TVector}
                  alt=""
                  className="w-[10px] h-[9px] bg-blue-400 rounded-md"
                />
                <h3 className="pl-2 text-sm font-semibold">$2,000</h3>
              </div>
            </div>

            {/* Buy Now Button */}
            <button className="flex items-center justify-center w-full">
              <img src={BuyNow} alt="Buy Now" className="w-full h-auto my-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularCollections;
