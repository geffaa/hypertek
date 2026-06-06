"use client";
import React from "react";
import heroImage from "../../assets/images/hero.webp";
import CustomButton from "../Buttons/Button1";

const HeroSection = () => {
  return (
    <header
      className="relative w-full h-[630px] scale-x-[-1] bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Content */}
      <div className="relative z-10 scale-x-[-1] flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8 pt-[11rem] h-full">
        {/* Headline */}
        <h1 className="mb-6 text-4xl md:text-5xl font-bold leading-tight">
          <span className="block">The Ultimate Gaming</span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Marketplace
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mb-12 max-w-3xl text-lg font-light text-gray-200 text-[clamp(16px,2.5vw,20px)] leading-relaxed">
          Where players and creators unite in a secure, next-generation
          ecosystem for{" "}
          <span className="font-semibold text-white">
            buying, selling, and trading
          </span>{" "}
          digital games.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          {["Explore Marketplace", "Start Selling Games"].map((label, i) => (
            <div
              key={i}
              className={`flex items-center cursor-pointer ${
                label === "Start Selling Games" ? "hidden sm:flex" : ""
              }`}
            >
              {/* Left edge bar */}
              <div
                className="bg-[#002AA8] mr-0.5 md:h-[1.3rem] h-[1.5rem]"
                style={{ width: "0.25rem" }}
              />

              {/* Left angled border */}
              <div
                className="border-[#002AA8] md:h-[2.7rem] h-[2.7rem]"
                style={{
                  width: "0.5rem",
                  borderStyle: "solid",
                  borderWidth: "0.375rem 0.25rem 0.375rem 0",
                }}
              />

              {/* Button body */}
              <div
                className="flex items-center justify-center text-white font-medium md:w-[168.31px] w-[172px] md:h-[39.59px] h-[2.4rem]"
                style={{
                  background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
                  border: "0.15rem solid #002AA8",
                }}
              >
                {label}
              </div>

              {/* Right angled border */}
              <div
                className="border-[#002AA8] md:h-[2.7rem] h-[2.7rem]"
                style={{
                  width: "0.5rem",
                  borderStyle: "solid",
                  borderWidth: "0.25rem 0 0.375rem 0.25rem",
                }}
              />

              {/* Right edge bar */}
              <div
                className="bg-[#002AA8]"
                style={{ width: "0.25rem", height: "1.5rem" }}
              />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/10 pt-8">
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
