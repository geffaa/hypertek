import React from "react";
import popularCollections from "../../assets/images/popular/popolar.png";
import TVector from "../../assets/images/popular/vector.png";
import CustomButton from "../Buttons/Button1";
import PageBackground from "../Common/BgEffect";


function PopularCollections() {
  return (
    <section className="flex flex-col gap-8 w-full px-4 sm:px-8 md:px-16 pt-12 ">
    {/* <PageBackground/> */}
      {/* Heading */}
      <div className="flex flex-col gap-2 items-start max-w-full px-4 md:px-0  ">
        <h1 className="text-white uppercase text-2xl sm:text-3xl ml-8 lg:text-[30px] font-goldman font-bold leading-[100%]">
          MarketPlace
        </h1>

        {/* Decorative underline bars */}
        <div className="flex gap-2 ml-8">
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
            className="bg-gray-800 rounded-lg shadow-md text-white p-4 flex-shrink-0 w-[280px] max-w-[305px] h-[400px] flex flex-col justify-between"
          >
            {/* Image container */}
            <div
  className="w-full h-[160px] overflow-hidden rounded-[19px]"
  style={{
    background: "linear-gradient(180deg, #977C34 0%, #493F26 100%)",
  }}
>
  <img
    src={popularCollections}
    alt="Collection"
    className="w-full h-full object-cover object-top scale-x-[-1]"
  />
</div>


            {/* Title */}
            <h2 className="text-lg font-bold mt-4">Monkey Ape</h2>

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

            {/* Buy Now Button fixed at bottom */}
            <div className="mt-auto flex justify-center">
              <CustomButton text="Buy Now" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularCollections;
