import React from "react";
import NewsImage1 from "../../assets/images/News/new1.png"; 
import NewsImage2 from "../../assets/images/News/new2.png";
import NewsImage3 from "../../assets/images/News/new3.png";
import NewRightImage from "../../assets/images/News/newRight.jpg";
import moreNews from "../../assets/images/News/moreNews.png";

export default function News() {
  return (
    <section className="w-full flex justify-center items-start px-4 md:px-6 py-12 md:py-20">
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

            <div className="flex flex-col gap-3 p-4">
              <h3 className="text-white text-xl sm:text-2xl font-bold uppercase font-goldman">
                Hyper QUEST : the awakening
              </h3>
              <p className="text-white text-sm sm:text-base font-inter leading-relaxed">
                Humanity didn’t conquer the stars—it fractured into them. After
                Earth’s collapse, survivors launched the Hyper Tek Exodus...
              </p>
            </div>
          </div>

          {/* Second Block (2 smaller side-by-side cards) */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Card 1 */}
            <div className="flex flex-col gap-4 w-full sm:w-[320px]">
              <img
                src={NewsImage2}
                alt="News 2"
                className="w-full max-h-[200px] object-cover rounded-lg"
              />
              <div className="flex flex-col p-4">
                <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
                  Hyper racing : the velocity wars
                </h3>
                <p className="text-white text-sm pt-2">
                  On Blacktrack Circuits, speed is war. Factions battle at 900
                  kph for control of energy routes and warp towers...
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col gap-4 w-full sm:w-[320px]">
              <img
                src={NewsImage3}
                alt="News 3"
                className="w-full max-h-[200px] object-cover rounded-lg"
              />
              <div className="flex flex-col p-4">
                <h3 className="text-white text-lg sm:text-xl font-bold uppercase font-goldman">
                  Overlord Realm : The Final Ascent
                </h3>
                <p className="text-white text-sm pt-2">
                  Establish dominion across stars. Conquer with armies, alliances,
                  or fear. Deploy psychic storms, orbital AI, and propaganda to bend
                  entire systems to your rule.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Right Column ================= */}
        <div className="flex flex-col gap-10 w-full md:w-[450px]">
          {/* Heading */}
          <div className="flex items-center w-full">
            <h2 className="text-white font-bold text-2xl sm:text-3xl font-goldman uppercase border-b-2 pb-1">
              News
            </h2>
            <div className="flex-1 ml-3 mt-8 h-[2px] bg-gradient-to-r from-white to-transparent"></div>
          </div>

          {/* Featured Block */}
          <div className="flex flex-col">
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
                className="flex flex-col sm:flex-row gap-4 w-full bg-[#111] rounded-lg overflow-hidden"
              >
                <img
                  src={NewRightImage}
                  alt={`Update ${block}`}
                  className="w-full sm:w-[200px] h-[140px] object-cover"
                />
                <div className="flex  p-3">
                  <p className="text-white text-sm sm:text-base font-inter leading-relaxed">
                    New update coming up on the 25th of august
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* More News Button */}
          <div className="flex justify-center mt-4">
            <button className="flex items-center justify-center w-[142px] h-[29px]">
              <img
                src={moreNews}
                alt="more news"
                className="w-[142px] h-[29px] object-contain"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
