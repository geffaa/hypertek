import React from "react";
import AboutTopImage from "../assets/images/aboutpage/aboutimage.png";
import DownloadBtn from "../assets/images/download.png";
import AboutUs1 from "../assets/images/aboutpage/aboutus.png";

import exchange from "../assets/images/aboutpage/Exchange.png";
import game from "../assets/images/aboutpage/game.png";
import vector from "../assets/images/aboutpage/Vector.png";

function About() {
  return (
    <>
      {/* Top Section */}
      <div className="flex flex-col items-center justify-center text-center text-white px-4 mt-[105px]">
        {/* Title */}
        <h1 className="font-inter font-semibold text-4xl md:text-5xl leading-[120%] mb-4">
          About Us
        </h1>

        {/* Description */}
        <p className="font-inter font-semibold text-lg md:text-xl leading-[150%] max-w-2xl mb-6">
          Empowering creators and collectors through blockchain technology.{" "}
          <br className="hidden md:block" />
          <span className="font-semibold">Hyper Tek</span> is where innovation
          meets art.
        </p>

        {/* Top Image */}
        <img
          src={AboutTopImage}
          alt="About Hyper Tek"
          className="w-full max-w-[640px] h-auto rounded-[40px] md:rounded-[161px] object-cover"
        />

        {/* Button */}
        <button className="my-12">
          <img src={DownloadBtn} alt="Download" />
        </button>
      </div>

      {/* Second Section */}
      <div className="bg-gradient-to-br from-blue-500/80 to-white/30 p-6 md:p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16 max-w-[1020px] mx-auto text-white px-4">
          {/* Text */}
          <div>
            <h2 className="font-inter font-semibold text-base mb-2">
              The year in 2117
            </h2>
            <p className="font-inter text-base leading-relaxed">
              The year is 2117. Humanity didn’t conquer the stars — it fractured
              into them. After Earth’s collapse, survivors launched the Hyper
              Tek Exodus, scattering AI, enhanced genomes, and prototypes across
              thousands of seed worlds. Each evolved in isolation forming new
              species, cultures, and technologies. At the center of it all lies
              the Echo Core, a quantum relic now pulsing with riddles, memories,
              and a call to power. It awakens you — a reborn Overlord, forged by
              legacy and technology.
            </p>
          </div>

          {/* Image */}
          <img
            src={AboutUs1}
            alt="About Hyper Tek Story"
            className="w-full max-w-[400px] h-auto shadow-lg"
          />
        </div>

        {/* Third Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16 max-w-[1020px] mx-auto text-white px-4">
          {/* Image */}
          <img
            src={AboutUs1}
            alt="About Hyper Tek Story"
            className="w-full max-w-[400px] h-auto shadow-lg"
          />

          {/* Text */}
          <div className="text-white">
            <h2 className="font-inter font-semibold text-base mb-4">
              Three Fronts of War
            </h2>

            <p className="font-inter text-base mb-3">
              <span className="font-semibold">HyperQuest 100 | The Awakening</span> — Explore ruins,
              clash with factions, and uncover ancient tech. Your choices shape
              your skills, species loyalty, and path: liberator or dominator,
              relic hunter or techno savant.
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
              or fear. Deploy psychic storms, orbital AI, and propaganda to bend
              entire systems to your rule.
            </p>
          </div>
        </div>
      </div>

      {/* Eco system section */}
      <div className="flex flex-col items-center text-center text-white mx-auto my-16 gap-2 max-w-[1161px] px-4">
        {/* Title */}
        <h1 className="font-inter font-bold text-[28px] md:text-[35px] leading-[100%] text-center">
          Our Ecosystem
        </h1>

        {/* Description */}
        <p className="font-inter font-normal text-lg md:text-[20px] max-w-[613px] pt-2 leading-[150%] text-center text-gray-300">
          Trusted by millions, we bring you a world-class suite of financial
          products in one platform.
        </p>

        <div className="flex flex-col md:flex-row w-full max-w-[1161px] gap-6 md:gap-[60px] mx-auto mt-5 p-6 rounded-[20px]">
          {/* NFA Card */}
          <div className="w-full md:w-[347px] h-[346px] rounded-[16px] bg-[#080E26] flex flex-col items-center justify-center p-4 text-center">
            <img src={exchange} alt="NFA" className="w-[93px] h-[89px] mb-4" />
            <h1 className="font-inter font-semibold text-xl mb-2 text-white">
              NFA
            </h1>
            <h4 className="font-inter text-base text-white/90">
              Discover and own NFAs that are as rare as they are valuable.
            </h4>
          </div>

          {/* Game Card */}
          <div className="w-full md:w-[347px] h-[346px] rounded-[16px] bg-[#080E26] flex flex-col items-center justify-center p-4 text-center">
            <img src={game} alt="Game" className="w-[95px] h-[62px] mb-4" />
            <h1 className="font-inter font-semibold text-xl mb-2 text-white">
              Game
            </h1>
            <h4 className="font-inter text-base text-white/90">
              Step into Hyper Tek and be part of a living universe where racing,
              quests, and realms collide.
            </h4>
          </div>

          {/* Marketplace Card */}
          <div className="w-full md:w-[347px] h-[346px] rounded-[16px] bg-[#080E26] flex flex-col items-center justify-center p-4 text-center">
            <img
              src={vector}
              alt="Marketplace"
              className="w-[80px] h-[80px] mb-4"
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
    </>
  );
}

export default About;
