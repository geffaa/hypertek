import React from "react";
import LeftImage from "../../assets/images/about/about.jpg";
import RightImage1 from "../../assets/images/about/left.jpg";
import RightImage2 from "../../assets/images/about/right.jpg";

export default function HyperTekDesign() {
  return (
    <section className="relative w-full px-0 overflow-hidden z-10">
      <div className="max-w-[1450px] mx-auto lg:pr-8 lg:pl-0">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
          {/* LEFT BIG IMAGE (Desktop only) */}
          <div className="hidden lg:flex relative bg-[#B0BDE4] items-center justify-center w-[520px] h-[520px]">
            {/* Vertical Label */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-[2px] h-20 bg-white" />
              <div className="[writing-mode:vertical-lr] rotate-180 my-3">
                <h2 className="outline-text text-white font-inter font-semibold text-[30px] tracking-widest">
                  HYPER TEK 100
                </h2>
              </div>
              <div className="w-[2px] h-20 bg-white" />
            </div>

            {/* Image */}
            <img
              src={LeftImage}
              alt="Hyper Tek Main"
              className="w-[510px] h-[414px] object-cover translate-x-24"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 flex flex-col gap-6 lg:gap-8 mt-6 lg:mt-14 lg:pl-12 xl:pl-20 pr-0">
            {/* TOP IMAGES */}
            <div className="grid grid-cols-2 gap-0 w-full">
              {/* First image */}
              <img
                src={RightImage1}
                alt="Right Image 1"
                className="w-full pl-4 h-[150px] sm:h-[255px] object-cover"
              />

              {/* Second image */}
              <img
                src={RightImage2}
                alt="Right Image 2"
                className="w-full h-[150px] sm:h-[255px] object-cover rounded-l-lg rounded-r-none"
              />
            </div>

            {/* TEXT (LOCKED UNDER IMAGES) */}
            <div className="w-full -mt-6">
              <h1 className="text-white pl-4  font-inter font-semibold text-lg md:text-xl mb-2">
                The year is 2117.
              </h1>

              <p className="text-white pl-4 pr-5 font-inter text-sm md:text-base leading-relaxed max-w-full">
                Humanity didn't conquer the stars—it fractured into them. After
                Earth's collapse, survivors launched the Hyper Tek Exodus,
                scattering AI, enhanced genomes, and prototypes across thousands
                of seed worlds. Each evolved in isolation, forming new species,
                cultures, and technologies. At the center of it all lies the
                Echo Core, a quantum relic now pulsing with riddles, memories,
                and a call to power. It awakens you, a reborn Overlord, forged
                by legacy and technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
