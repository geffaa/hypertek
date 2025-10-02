import React from "react";
import heroImage from "../../assets/images/hero.jpg";
import Logo from "../../assets/images/logo.png";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../Buttons/Button2";
import "../../App.css";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div
      className="w-full h-[630px] scale-x-[-1] relative"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center 1px",
      }}
    >
      {/* Hero Content */}
      <div className="scale-x-[-1] z-10 flex flex-col justify-center h-full container mx-auto px-4 md:px-6">
        {/* Text */}
        <div className="flex flex-col max-w-[90%] md:max-w-[80%]">
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white leading-[100%] uppercase m-0">
            Hyper Tek 100:
          </h1>
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white leading-[100%] uppercase m-0">
            WHERE <span className="outline-text">Legends</span> Are <br />
            <span className="md:pl-16">Forged.</span>
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link to="/market-place">
            <CustomButton 
              text="MarketPlace"
              bgcolor="linear-gradient(180deg, #002AA8 0%, #001142 100%)"
            />
          </Link>
          <Link to="/download-game">
            <CustomButton2 text="Download Game" bgcolor="" />
          </Link>
        </div>
      </div>
    </div>
  );
}
