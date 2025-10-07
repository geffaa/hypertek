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
              <div className="flex items-center">
      {/* Left small bar */}
      <div
        className="bg-[#002AA8] mr-0.5"
        style={{
          width: "0.25rem", // ~3.99px
          height: "1.3rem", // ~21.93px
        }}
      ></div>

      {/* Left angled border */}
      <div
        className="border-[#002AA8]"
        style={{
          width: "0.5rem", // ~7.97px
          height: "2.2rem", // ~42.86px
          borderStyle: "solid",
          borderWidth: "0.375rem 0.25rem 0.375rem 0", // ~6px 4px 6px 0
        }}
      ></div>

      {/* Main button area */}
      <div
        className="flex items-center justify-center text-white font-medium"
        style={{
          width: "9rem", // ~168px
          height: "2rem", // ~39.59px
          // background: "linear-gradient(180deg, #002AA8 0%, #001142 100%)",
          border: "0.15rem solid #002AA8", // ~2.42px
        }}
      >
        Download Game
      </div>

      {/* Right angled border */}
      <div
        className="border-[#002AA8]"
        style={{
          width: "0.5rem", // ~7.97px
          height: "2.2rem", // ~42.86px
          borderStyle: "solid",
          borderWidth: "0.25rem 0 0.375rem 0.25rem", // ~4px 0 6px 4px
        }}
      ></div>

      {/* Right small bar */}
      <div
        className="bg-[#002AA8]"
        style={{
          width: "0.25rem", // ~3.99px
          height: "1.3rem", // ~21.93px
        }}
      ></div>
    </div>
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
