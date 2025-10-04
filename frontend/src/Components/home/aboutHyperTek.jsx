import React from "react";
import LeftImage from "../../assets/images/about/about.jpg";
import RightImage1 from "../../assets/images/about/left.jpg";
import RightImage2 from "../../assets/images/about/right.jpg";
import PageBackground from "../Common/BgEffect";
import GlowingOrb from "../Common/BgColoring";

export default function HyperTekDesign() {
  return (
    <section className="relative w-full overflow-hidden z-10 py-8">
      {/* Glowing Orb */}
      <div
        style={{
          bottom: `${20}px`,
          right: `${90}px`,
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

      {/* Main Container */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          
          {/* Left Box - Hidden on small screens */}
          <div className="hidden lg:relative lg:bg-[#B0BDE4] lg:flex items-center justify-center w-full lg:w-[520px] h-[300px] sm:h-[400px] lg:h-[520px] rounded-lg overflow-hidden">
            
            {/* Vertical Side Label (Large screen) */}
            <div className="hidden lg:flex flex-col items-center absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <div className="w-[2px] h-20 bg-white"></div>
              <div className="flex items-center justify-center my-3 [writing-mode:vertical-lr] rotate-180">
                <h2 className="font-inter font-semibold text-[30px] uppercase tracking-widest text-white">
                  HYPER TEK 100
                </h2>
              </div>
              <div className="w-[2px] h-20 bg-white"></div>
            </div>

            {/* Big Image */}
            <img
              src={LeftImage}
              alt="Hyper Tek Main"
              className="w-[90%] max-w-[400px] sm:max-w-[450px] lg:max-w-[510px] h-[220px] sm:h-[320px] lg:h-[414px] object-cover lg:ml-24"
            />
          </div>

          {/* Right Side - Full width on small screens */}
          <div className="flex-1 flex flex-col gap-6 lg:gap-8 mt-4 lg:mt-0">
            
           {/* Two images side by side */}
<div className="flex flex-row gap-4 sm:gap-6 w-full">
  <div className="flex-1">
    <img
      src={RightImage1}
      alt="Right Image 1"
      className="w-full h-[150px] sm:h-[255px] object-cover rounded-lg"
    />
  </div>
  <div className="flex-1">
    <img
      src={RightImage2}
      alt="Right Image 2"
      className="w-full h-[150px] sm:h-[255px] object-cover rounded-lg"
    />
  </div>
</div>
            {/* Paragraph */}
            <div className="w-full">
              <p className="text-white text-sm md:text-base leading-relaxed font-inter">
                <span className="font-semibold">The year is 2117.</span> <br />{" "}
                Humanity didn&apos;t conquer the stars—it fractured into them. After
                Earth&apos;s collapse, survivors launched the Hyper Tek Exodus,
                scattering AI, enhanced genomes, and prototypes across thousands of
                seed worlds. Each evolved in isolation, forming new species,
                cultures, and technologies. At the center of it all lies the Echo
                Core, a quantum relic now pulsing with riddles, memories, and a call
                to power. It awakens you, a reborn Overlord, forged by legacy and
                technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}