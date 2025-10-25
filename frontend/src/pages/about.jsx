import React from "react";
import AboutTopImage from "../assets/images/aboutpage/aboutimage.png";
import CustomButton from "../Components/Buttons/Button1";
import aboutBG from "../assets/images/about/aboutbg.png";
import RightImage from "../assets/images/aboutpage/aboutRight.png";
import exchange from "../assets/images/aboutpage/Exchange.png";
import game from "../assets/images/aboutpage/game.png";
import vector from "../assets/images/aboutpage/Vector.png";
import GlowingOrb from "../Components/Common/BgColoring";
import bgleft from "../assets/images/about/bgleft.jpg";
import centerBg from "../assets/images/about/centerbg.png";
import bgright from "../assets/images/about/bgright.jpg";

import leftImage from "../assets/images/about/leftImage.png";
import CenterImage from "../assets/images/about/centerImae.png";
import rightImage from "../assets/images/about/rightImage.png";

function About() {
  return (
    <>
      <div className="relative z-10">
        <GlowingOrb Xaxis={100} Yaxis={350} />
        <GlowingOrb Xaxis={1000} Yaxis={400} />

        {/* ---------------- Top Section ---------------- */}
        <div
          className="flex flex-col items-center justify-center text-center text-white px-4 py-16"
          style={{
            background: `
              radial-gradient(circle at 10% 30%, rgba(8, 1, 33, 0.9) 0%, transparent 70%),
              radial-gradient(circle at 70% 50%, rgba(13, 7, 22, 0.93) 0%, transparent 60%),
              radial-gradient(circle at 50% 90%, rgba(5, 4, 17, 0.96) 0%, transparent 90%),
              #0d0d14
            `,
          }}
        >
          <h1 className="font-inter font-semibold text-4xl mt-[90px] md:text-5xl leading-[120%] mb-4">
            About Us
          </h1>

          <p className="font-inter font-semibold text-lg md:text-xl leading-[150%] max-w-2xl mb-6">
            Empowering creators and collectors through blockchain technology.{" "}
            <br className="hidden md:block" />
            <span className="font-semibold">Hyper Tek</span> is where innovation
            meets art.
          </p>

          {/* -------------------------------- Top Image with glass effect -------------------------------  */}
          {/* the top main images  */}
          <div className="relative w-[314px]  h-[256.39px] md:w-[640px] md:h-[522.58px] lg:w-[640px] lg:h-[522.58px]">
            {/* Left background */}
            <div
              className=" opacity-[0.2] md:opacity-[1]
  absolute z-10
  top-[40px] left-[0px] w-[124.18px] h-[216.32px] rounded-[79.09px]
  md:w-[253px] md:h-[440.41px] md:top-[80px] md:left-[4px] md:rounded-[161px]
  lg:w-[253px] lg:h-[440.41px] lg:top-[80px] lg:left-[15px] lg:rounded-[161px]
"
              style={{
                backgroundImage: `url(${bgleft})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
               backgroundPosition: "center",
              }}
            />
            {/* Left image */}
            <img
              src={leftImage}
              alt=""
              className="absolute top-[65.71px] left-[0.4px] md:top-[100px] md:left-[25px] z-20 w-[116.66px] h-[165.07px] md:w-[237.78px] md:h-[336.45px] lg:w-[237.78px] lg:h-[336.45px]"
              style={{
                objectFit: "contain",
              }}
            />

            {/* Right background */}
            <div
              className=" opacity-[0.2] md:opacity-[1]
  absolute z-10
  top-[40px] left-[190px] w-[124.18px] h-[216.32px] rounded-[79.09px]
  md:top-[80px] md:left-[430px] md:w-[253px] md:h-[440.41px] md:rounded-[161px]
  lg:top-[80px] lg:left-[430px] lg:w-[253px] lg:h-[440.41px] lg:rounded-[161px]
"
              style={{
                
                backgroundImage: `url(${bgright})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              
              }}
            />
            {/* Right image */}
            <img
              src={rightImage}
              alt=""
              className="
      absolute z-20
      top-[65.31px] left-[201.86px] w-[117.45px] h-[166.09px]
      md:top-[110px] md:left-[390px] md:w-[239.4px] md:h-[338.52px]
      lg:top-[110px] lg:left-[440px] lg:w-[239.4px] lg:h-[338.52px]
    "
              style={{
                objectFit: "contain",
              }}
            />

            {/* Center background */}
            <div
              className=" opacity-[0.2] md:opacity-[1]
  absolute z-10
  w-[147.18px] h-[256.39px] top-[20px] left-[85px] rounded-[79.09px]
  md:w-[299.98px] md:h-[522.58px] md:top-[23px] md:left-[210px] md:rounded-[161px]
  lg:w-[299.98px] lg:h-[522.58px] lg:top-[23px] lg:left-[214px] lg:rounded-[161px]
"
              style={{
                backgroundImage: `url(${centerBg})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                // opacity: 0.2,
              }}
            />
            {/* Center image */}
            <img
              src={CenterImage}
              alt=""
              className="absolute top-[52.34px] left-[97px] h-[190.63px] md:top-[75px] md:left-[217.65px] z-30 w-[135.64px] h-[191.84px] md:w-[276.46px] md:h-[391.01px] lg:w-[276.46px] lg:h-[391.01px]"
              style={{ 
                objectFit: "contain",
              }}
            />
          </div>

          {/* ----------------------------------- ------------------------------ */}

          <div className="mt-16 cursor-pointer ">
            {/* Show on large screens */}
            <div className="hidden sm:block">
              <CustomButton text="Download" />
            </div>

            {/* Show on small screens */}
            <div className="sm:hidden">
              <span className="text-white text-lg font-semibold">Story</span>
            </div>
          </div>
        </div>

        {/* ---------------- Second Section ---------------- */}
        <div
          className="relative w-full z-10 min-h-[750px] overflow-visible bg-[#0d0d14]"
          style={{
            position: "relative",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.9,
          }}
        >
          <GlowingOrb Xaxis={1100} Yaxis={700} />

          {/* Story Section */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-4 max-w-[1020px] mx-auto text-white px-4">
            <img
              src={RightImage}
              alt="About Hyper Tek Story"
              className="w-full max-w-[400px] h-auto shadow-lg rounded-xl object-contain order-1 md:order-2"
            />

            <div className="order-2 md:order-1">
              <h2 className="font-inter font-semibold text-base">
                The year in 2117
              </h2>
              <p className="font-inter text-base leading-relaxed">
                The year is 2117. Humanity didn't conquer the stars — it
                fractured into them. After Earth's collapse, survivors launched
                the Hyper Tek Exodus, scattering AI, enhanced genomes, and
                prototypes across thousands of seed worlds. Each evolved in
                isolation forming new species, cultures, and technologies. At
                the center of it all lies the Echo Core, a quantum relic now
                pulsing with riddles, memories, and a call to power. It awakens
                you — a reborn Overlord, forged by legacy and technology.
              </p>
            </div>
          </div>

          {/* War Section */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12 md:mt-16 max-w-[1020px] mx-auto text-white px-4">
            <img
              src={RightImage}
              alt="About Hyper Tek Story"
              className="w-full max-w-[400px] h-auto shadow-lg rounded-xl object-contain order-1 md:order-1"
            />

            <div className="text-white order-2 md:order-2">
              <h2 className="font-inter font-semibold text-base">
                Three Fronts of War
              </h2>

              <p className="font-inter text-base mb-3">
                <span className="font-semibold">
                  HyperQuest 100 | The Awakening
                </span>{" "}
                — Explore ruins, clash with factions, and uncover ancient tech.
                Your choices shape your skills, species loyalty, and path:
                liberator or dominator, relic hunter or techno savant.
              </p>

              <p className="font-inter text-base mb-3">
                <span className="font-semibold">Hyper Racing 100</span> — The
                Velocity Wars: On Blacktrack Circuits, speed is war. Factions
                battle at 900 kph for control of energy routes and warp towers.
                Your vehicle is your weapon and your rise rewrites the map.
              </p>

              <p className="font-inter text-base">
                <span className="font-semibold">
                  Overlord Realm | The Final Ascent
                </span>
                <br />
                Establish dominion across stars. Conquer with armies, alliances,
                or fear. Deploy psychic storms, orbital AI, and propaganda to
                bend entire systems to your rule.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------- Ecosystem Section ---------------- */}
        <div className="flex flex-col relative z-10 items-center text-center md:mt-2 mt-12 text-white mx-auto gap-2 max-w-[1161px] px-4">
          <GlowingOrb Xaxis={1000} Yaxis={0} />
          <h1 className="font-inter font-bold z-10 text-[28px] md:text-[35px] leading-[100%] text-center mt-4 md:mt-6">
            Our Ecosystem
          </h1>

          <p className="font-inter font-normal text-lg md:text-[20px] max-w-[613px] pt-2 leading-[150%] text-center text-gray-300">
            Trusted by millions, we bring you a world-class suite of financial
            products in one platform.
          </p>

          <div className="flex flex-col md:flex-row w-full max-w-[1161px] gap-6 md:gap-[60px] mx-auto mt-5 p-6">
            {/* NFA Card */}
            <div className="w-full md:w-[347px] h-[346px] rounded-[16px] bg-[#080E26] flex flex-col items-center justify-center p-4 text-center">
              <img
                src={exchange}
                alt="NFA"
                className="w-[93px] h-[89px] mb-4 object-contain"
              />
              <h1 className="font-inter font-semibold text-xl mb-2 text-white">
                NFA
              </h1>
              <h4 className="font-inter text-base text-white/90">
                Discover and own NFAs that are as rare as they are valuable.
              </h4>
            </div>

            {/* Game Card */}
            <div className="w-full md:w-[347px] h-[346px] rounded-[16px] bg-[#080E26] flex flex-col items-center justify-center p-4 text-center">
              <img
                src={game}
                alt="Game"
                className="w-[95px] h-[62px] mb-4 object-contain"
              />
              <h1 className="font-inter font-semibold text-xl mb-2 text-white">
                Game
              </h1>
              <h4 className="font-inter text-base text-white/90">
                Step into Hyper Tek and be part of a living universe where
                racing, quests, and realms collide.
              </h4>
            </div>

            {/* Marketplace Card */}
            <div className="w-full md:w-[347px] h-[346px] rounded-[16px] bg-[#080E26] flex flex-col items-center justify-center p-4 text-center">
              <img
                src={vector}
                alt="Marketplace"
                className="w-[80px] h-[80px] mb-4 object-contain"
              />
              <h1 className="font-inter font-semibold text-xl mb-2 text-white">
                MarketPlace
              </h1>
              <h4 className="font-inter text-base text-white/90">
                The Hyper Tek Marketplace is your gateway to rare gear, powerful
                NFAs, and exclusive upgrades that shape your journey.
              </h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
