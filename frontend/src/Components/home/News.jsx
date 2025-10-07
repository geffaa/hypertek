import React from "react";
import NewsImage1 from "../../assets/images/News/new1.png";
import NewsImage2 from "../../assets/images/News/new2.png";
import NewsImage3 from "../../assets/images/News/new3.png";
import NewRightImage from "../../assets/images/News/newRight.jpg";
import CustomButton from "../Buttons/Button1";
import PageBackground from "../Common/BgEffect";
import GlowingOrb from "../Common/BgColoring";
import { Link } from "react-router-dom";


export default function News() {
  return (
    <section className="w-full z-10 flex justify-center items-start px-4 md:px-6 py-10 md:py-12 relative">
      
      {/* first for top  */}
      <div
        style={{
          bottom: `${890}px`,
          right: `${110}px`,
        }}
         className="absolute 
             w-[120px] h-[120px] 
             md:w-[250px] md:h-[250px] 
             rounded-full 
             bg-gradient-to-b from-blue-500/70 via-blue-800/80 to-white/0
             blur-[80px] md:blur-[100px]
             shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                    0_0_100px_50px_rgba(59,130,246,0.4),
                    0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>

       <div
        style={{
          bottom: `${90}px`,
          right: `${100}px`,
        }}
         className="absolute 
             w-[120px] h-[120px] 
             md:w-[250px] md:h-[250px] 
             rounded-full 
             bg-gradient-to-b from-blue-500/70 via-blue-600/80 to-white/30
             blur-[80px] md:blur-[100px]
             shadow-[0_0_40px_20px_rgba(59,130,246,0.6),
                    0_0_100px_50px_rgba(59,130,246,0.4),
                    0_0_200px_100px_rgba(59,130,246,0.2)]"
      ></div>
      
      <GlowingOrb Xaxis={220} Yaxis={400}/>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-[1247px]">
        {/* ================= Left Column ================= */}
        <div className="flex flex-col gap-8 w-full md:w-[680px]">
          {/* First Block */}
         <div className="flex flex-col gap-5">
  <img
    src={NewsImage1}
    alt="News 1"
    className="w-full max-h-[350px] object-cover rounded-lg"
  />
  <div className="flex flex-col gap-3 pt-2 md:p-4 w-full">
    <h3 className="text-white text-xl sm:text-2xl font-bold uppercase font-goldman w-full whitespace-nowrap overflow-hidden text-ellipsis">
      Hyper QUEST : the awakening
    </h3>
    <p className="text-white text-sm sm:text-base font-inter leading-relaxed md:w-[400px]">
      Explore ruins, clash with factions, and uncover ancient tech.
      Your choices shape your skills, species loyalty, and path:
      liberator or dominator, relic hunter or techno savant.
    </p>
  </div>
</div>

          {/* Second Block (2 smaller side-by-side cards) */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Card 1 */}
            <div className="flex flex-col gap-4 w-full sm:w-1/2">
              <img
                src={NewsImage2}
                alt="News 2"
                className="w-full max-h-[200px] object-cover rounded-lg"
              />
              <div className="flex flex-col ">
                <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
                  Hyper racing : the velocity <br /> wars
                </h3>
                <p className="text-white text-sm pt-2">
                  On Blacktrack Circuits, speed is war. Factions battle at 900
                  kph for control of energy routes and warp towers...
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col gap-4 w-full sm:w-1/2">
              <img
                src={NewsImage3}
                alt="News 3"
                className="w-full max-h-[200px] object-cover rounded-lg"
              />
              <div className="flex flex-col ">
                <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
                  Overlord Realm : <br /> The Final Ascent
                </h3>
                <p className="text-white text-sm pt-2">
                  Establish dominion across stars. Conquer with armies,
                  alliances, or fear. Deploy psychic storms, orbital AI, and
                  propaganda to bend entire systems to your rule.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Right Column ================= */}
        <div className="flex flex-col z-10 gap-10 w-full md:w-[450px]">
          {/* Heading */}
         <div className="hidden sm:flex items-center w-full">
  <h2 className="text-white font-bold text-2xl sm:text-3xl font-goldman uppercase border-b-2 border-white pb-1">
    News
  </h2>
  <div className="flex-1 ml-3 mt-10 h-[2px] bg-gradient-to-r from-white to-transparent"></div>
</div>

          {/* Featured Block */}
         <div className="hidden sm:flex flex-col">
  <img
    src={NewRightImage}
    alt="Featured News"
    className="w-full max-h-[200px] object-cover rounded-lg"
  />
  <div className="text-white px-3 py-2">
    <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
      NEW PARTNERSHIP WITH GOD OF WAR GAME
    </h3>
  </div>
</div>

          {/* Horizontal Blocks */}
        <div className="flex flex-col gap-4">
  {[1, 2, 3].map((block) => (
    <div
      key={block}
      className="flex flex-row gap-3 w-full bg-[#111] rounded-lg overflow-hidden p-2"
    >
      <img
        src={NewRightImage}
        alt={`Update ${block}`}
        className="w-[100px] h-[80px] sm:w-[200px] sm:h-[140px] object-cover"
      />
      <div className="flex p-2">
        <p className="text-white text-xs sm:text-base font-inter leading-relaxed">
          New update coming up on the 25th of august
        </p>
      </div>
    </div>
  ))}
</div>

          {/* More News Button */}
<div className="flex justify-start sm:justify-center mt-4">
  <Link to="/more-news">
    <CustomButton text="More News" />
  </Link>
</div>
        </div>
      </div>
    </section>
  );
}
