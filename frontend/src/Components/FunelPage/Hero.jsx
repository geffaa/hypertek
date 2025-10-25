"use client";
import React from "react";
import heroImage from "../../assets/images/hero.jpg";
import CustomButton from "../Buttons/Button1";

const HeroSection = () => {
  return (
    <header
      className="relative scale-x-[-1] flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center 1px",
      }}
    >
      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Main Content */}
      <div className="relative z-10 px-4 scale-x-[-1] text-center text-white sm:px-6 lg:px-8 w-full max-w-7xl mx-auto mt-24 lg:mt-36">
        {/* Trust Badge */}
        {/* <div className="md:flex hidden justify-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm font-medium text-gray-200">
                Trusted by 500K+ Gamers Worldwide
              </span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="text-sm text-gray-300">⭐ 4.9/5 Rating</div>
          </div>
        </div> */}

        {/* Headline */}
        <h1 className="mb-6  text-4xl md:text-5xl font-bold leading-tight ">
          <span className="block">The Ultimate Gaming</span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Marketplace
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="mx-auto mb-12 max-w-3xl text-lg font-light text-gray-200 text-[clamp(16px,2.5vw,20px)]
 leading-relaxed"
        >
          Where players and creators unite in a secure, next-generation
          ecosystem for{" "}
          <span className="font-semibold text-white">
            buying, selling, and trading
          </span>{" "}
          digital games.
        </p>

        {/* CTA Buttons */}
        <div className="flex sm:flex-row items-center justify-center gap-6 mb-16">
          {["Explore Marketplace", "Start Selling Games"].map((label, i) => (
            <div 
              key={i}
              
              className={`flex items-center cursor-pointer ${
                label === "Start Selling Games" ? "hidden sm:flex" : ""
              }`}
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
                {label}
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
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-12">
          {[
            { number: "250K+", label: "Games Available" },
            { number: "500K+", label: "Active Users" },
            { number: "$50M+", label: "Transactions" },
            { number: "99.8%", label: "Satisfaction" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-300 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
