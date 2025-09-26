import React from "react";
import heroImage from "../../assets/images/hero.jpg";
import Logo from "../../assets/images/logo.png";
import CustomButton from "../Buttons/Button1";
import CustomButton2 from "../Buttons/Button2";
import "../../App.css";

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
    <section className="w-full h-screen relative flex overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 pointer-events-none bg-no-repeat bg-cover bg-top scale-x-[-1] brightness-100"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>

      {/* Right-side brightness overlay */}
      <div className="absolute top-0 right-0 h-full w-1/3 pointer-events-none bg-gradient-to-l from-white/50 to-transparent mix-blend-screen"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col mt-16 items-center justify-center gap-6 px-4 md:px-0 text-center max-w-full">
        {/* Text */}
        <div className="flex flex-col items-center justify-center max-w-[90%]">
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white leading-[100%] uppercase text-center m-0">
            Hyper Tek 100:
          </h1>
          <h1 className="font-[Goldman] font-bold text-[clamp(28px,5vw,40px)] text-white leading-[100%] uppercase text-center m-0">
            WHERE <span className="outline-text">Legends</span>
            Are Forged.
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full max-w-[90%]">
          <CustomButton
            text="MarketPlace"
            bgcolor="linear-gradient(180deg, #002AA8 0%, #001142 100%)"
          />
          <CustomButton2 text="Download Game" bgcolor="" />
        </div>
      </div>

      {/* Bottom Bar with Logos */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-center bg-[#00134C80] h-10 md:h-12 px-1 z-20">
        <div className="flex flex-wrap items-center w-full max-w-7xl justify-center gap-4 md:justify-center">
          {logoItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="w-7 h-6 md:w-7 md:h-6" />
              <span className="text-white font-bold font-[11px] text-sm md:text-base whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
