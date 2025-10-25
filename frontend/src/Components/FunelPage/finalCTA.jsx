import React from "react";
import Button1 from "../Buttons/Button1";

const FinalCTA = () => {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-br from-gray-900 to-slate-950 overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-slate-700/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Section Title */}
        <h2 className="text-[clamp(32px,6vw,42px)] font-bold text-white mb-6 leading-tight">
          Begin Your{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Gaming Evolution
          </span>
        </h2>
        
        {/* Supporting Text */}
        <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto">
          Join Hyper tek the future of digital gaming commerce through 
          secure innovation and unparalleled community value.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          {/* <Button1 text="Contribution Now" /> */}
          <div
              
              className={`flex items-center cursor-pointer `}
            >
              <div
                className="bg-[#002AA8] mr-0.5 md:h-[1.3rem] h-[1.5rem]"
                style={{ width: "0.25rem", height: "" }}
              />
              <div
                className="border-[#002AA8] md:h-[2.7rem] h-[2.7rem]"
                style={{
                  width: "0.5rem",
                  height: "",
                  borderStyle: "solid",
                  borderWidth: "0.375rem 0.25rem 0.375rem 0",
                }}
              />
              <div
                className="flex items-center bg-blue-800 justify-center text-white font-medium md:w-[168.31px] w-[172px] md:h-[39.59px] h-[2.4rem]"
                style={{
          background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
          border: "0.15rem solid #002AA8",
        }}
              >
                Contribure Now
              </div>
              <div
                className="border-[#002AA8] md:h-[2.7rem] h-[2.7rem]"
                style={{
                  width: "0.5rem",
                  height: "",
                  borderStyle: "solid",
                  borderWidth: "0.25rem 0 0.375rem 0.25rem",
                }}
              />
              <div
                className="bg-[#002AA8]"
                style={{ width: "0.25rem", height: "1.5rem" }}
              />
            </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;