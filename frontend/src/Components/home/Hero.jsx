import React from "react";
import heroImage from "../../assets/images/hero.jpg";
import Logo from "../../assets/images/logo.png";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../Buttons/Button2";
import "../../App.css";
import { Link } from "react-router-dom";

export default function Hero() {
  const logoItems = [
    { text: "Hyper Tek" },
    { text: "Hyper Tek" },
    { text: "Hyper Tek" },
    { text: "Hyper Tek" },
    { text: "Hyper Tek" },
    { text: "Hyper Tek" },
    { text: "Hyper Tek" },
  ];
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
      <div className="scale-x-[-1] z-10 flex flex-col justify-center h-full container pt-[230px] mx-auto px-4 md:px-6">
        {/* Text */}
        <div className="flex flex-col max-w-[90%] md:max-w-[80%] text-center md:text-left">
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white md:pl-12 leading-[100%] uppercase m-0">
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
          <Link to="/download-game" className="hidden md:block">
            <CustomButton2 text="Download Game" bgcolor="" />
          </Link>
        </div>
      </div>

      {/* Bottom Bar with Logos */}
      <div className="absolute bottom-0 scale-x-[-1] left-0 w-full flex justify-center items-center bg-[#00134C80] h-10 md:h-12 px-1 z-20">
  <div className="flex flex-wrap items-center w-full max-w-7xl justify-center gap-4 md:justify-center">
    {logoItems.slice(0, 3).map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="w-7 h-6 md:w-7 md:h-6" />
        <span className="text-white font-bold font-[11px] text-sm md:text-base whitespace-nowrap">
          {item.text}
        </span>
      </div>
    ))}
    {/* Show remaining items on medium screens and up */}
    {logoItems.slice(3).map((item, i) => (
      <div key={i + 3} className="hidden md:flex items-center gap-2">
        <img src={Logo} alt="Logo" className="w-7 h-6 md:w-7 md:h-6" />
        <span className="text-white font-bold font-[11px] text-sm md:text-base whitespace-nowrap">
          {item.text}
        </span>
      </div>
    ))}
  </div>
</div>
    </div>
  );
}
