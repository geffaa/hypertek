import React from "react";
import heroImage from "../../assets/images/hero.jpg";
import Logo from "../../assets/logo1.png";
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
      <div className="scale-x-[-1] z-10 flex flex-col justify-center h-full container pt-[100px]  mx-auto px-4 md:px-6">
        {/* Text */}
        <div className="flex flex-col max-w-[100%] md:max-w-[78%] text-center md:text-left md:ml-16">
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white md:pl-12 leading-[100%] uppercase m-0">
            Hyper Tek 100:
          </h1>
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white leading-[100%] uppercase m-0">
            WHERE <span className="outline-text">Legends</span> Are{" "}
            <span className="hidden md:inline">
              <br />
            </span>
            <span className="md:hidden"> </span>Forged.
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pl-8 mt-6 md:ml-16">
          <Link to="/market-place" className="scale-90 md:scale-100">
            <CustomButton
              text="MarketPlace"
              bgcolor="linear-gradient(180deg, #002AA8 0%, #001142 100%)"
            />
          </Link>
          <Link
            to="#"
            className="hidden md:block"
            onClick={(e) => {
              e.preventDefault();
              console.log("Download button clicked!");
            }}
          >
            {/* Download Game Button */}
            <Link
              to="#"
              className="hidden md:block"
              onClick={(e) => e.preventDefault()}
            >
              <CustomButton2 text="Download Game" />
            </Link>
          </Link>
        </div>
      </div>

      {/* Bottom Bar with Logos */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1493px] bg-[#00134C80] h-10 md:h-12 overflow-hidden z-20">
        {/* Moving Track */}
        <div className="flex items-center gap-6 animate-marqueeRight whitespace-nowrap">
          {[...logoItems, ...logoItems].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 flex-shrink-0 pt-2 scale-x-[-1]"
            >
              <img src={Logo} alt="Logo" className="w-6 h-5 md:w-7 md:h-6" />
              <span className="text-white font-inter font-bold uppercase text-[11.69px] leading-[1] tracking-[0.08em] text-center">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
