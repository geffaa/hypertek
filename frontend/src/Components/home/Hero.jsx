import React from "react";
import heroImage from "../../assets/images/hero.jpg";
import Button1 from "../../assets/images/hero section/button1.png";
import Button2 from "../../assets/images/hero section/button2.png";
import hyper1 from "../../assets/images/hero section/hyper100.png";
import whereImage from "../../assets/images/hero section/where.png";
import Logo from "../../assets/images/logo.png";

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
    <section className="w-full h-screen relative flex items-center justify-center">
      {/* Background Image (flipped) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          transform: "scaleX(-1)",
        }}
      ></div>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4 md:px-0 text-center">
        {/* First Section (Images Only) */}
        <div className="flex flex-col items-center justify-center gap-2">
          <img src={hyper1} alt="Hyper Tek 100" className="h-12 md:h-12 w-auto"/>
          <img src={whereImage} alt="Where Legends Are Forged" className="h-24 md:h-24 w-auto"/>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <img src={Button1} alt="Button 1" className="h-10 sm:h-11 w-auto"/>
          <img src={Button2} alt="Button 2" className="h-10 sm:h-11 w-auto"/>
        </div>
      </div>

      {/* Bottom Bar with Logos */}
      <div className="absolute bottom-0 left-0 w-full flex justify-start items-center bg-[#00134C80] h-10 md:h-12 px-1">
        <div className="flex flex-wrap items-center w-full max-w-7xl justify-center gap-4 md:justify-start">
          {logoItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="w-7 h-6 md:w-7 md:h-6"/>
              <span className="text-white font-bold text-sm md:text-base whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
