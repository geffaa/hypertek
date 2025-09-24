import React from "react";
import PopularImage from '../../assets/images/popular/popolar.png';
import MarketImage from '../../assets/images/popular/popolar.png'; // you can use a different image
import TVector  from '../../assets/images/popular/vector.png';
import BuyNow  from '../../assets/images/popular/buynow.png';

function MarketPlace() {
  // Render cards with dynamic image and title
  const renderCards = (image, title) => (
    [...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-800 rounded-lg shadow-md flex-shrink-0 text-white p-4"
        style={{
          width: "305px",
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
            src={image}
            alt={title}
            className="w-full h-auto object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold mb-2">{title}</h2>

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
          <img src={BuyNow} alt="Buy Now" className="w-full h-auto my-8" />
        </button>
      </div>
    ))
  );

  return (
    <section className="flex flex-col gap-12 w-full">

    

      {/* Marketplace Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 ml-12 items-start" style={{ width: "429px", height: "52px" }}>
          <h1
            className="text-white uppercase"
            style={{
              fontFamily: "Goldman",
              fontWeight: 700,
              fontSize: "30px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            Marketplace
          </h1>
          <div className="flex gap-2">
            <div className="h-[3px] w-12 bg-white"></div>
            <div className="h-[3px] w-20 bg-white"></div>
            <div className="h-[3px] w-8 bg-white"></div>
            <div className="h-[3px] w-40 bg-gradient-to-r from-white to-transparent"></div>
          </div>
        </div>
        <div className="flex gap-6 items-center justify-center flex-wrap">
          {renderCards(MarketImage, "Market Ape")}
        </div>
      </div>

    </section>
  );
}

export default MarketPlace;
