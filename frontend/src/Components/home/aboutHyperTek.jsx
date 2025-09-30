import React from "react";
import LeftImage from "../../assets/images/about/about.jpg";
import RightImage1 from "../../assets/images/about/left.jpg";
import RightImage2 from "../../assets/images/about/right.jpg";
import PageBackground from "../Common/BgEffect";

export default function HyperTekDesign() {
  return (
    <section className="relative my-16 w-full overflow-x-hidden">
      {/* <PageBackground/> */}

      <div className="flex flex-col lg:flex-row">
        {/* Left Box */}
        <div className="relative bg-[#B0BDE4] flex items-center justify-center w-full lg:w-[520px] h-[300px] sm:h-[400px] lg:h-[520px]">
          {/* Vertical Side Label (Large screen) */}
          <div className="hidden lg:flex flex-col items-center absolute left-[50px] top-1/2 -translate-y-1/2 z-10">
            <div className="w-[2px] h-20 bg-white"></div>
            <div className="flex items-center justify-center my-3 [writing-mode:vertical-lr] rotate-180">
              <h2 className="font-inter font-semibold text-[30px] uppercase tracking-widest text-white">
                HYPER TEK 100
              </h2>
            </div>
            <div className="w-[2px] h-20 bg-white"></div>
          </div>

          {/* Horizontal Label (Small screen) */}
          <div className="flex lg:hidden items-center justify-center w-full absolute top-2 px-4">
            <div className="flex-1 h-[2px] bg-white"></div>
            <h2 className="mx-3 font-inter font-semibold text-base sm:text-lg uppercase tracking-widest text-white whitespace-nowrap">
              HYPER TEK 100
            </h2>
            <div className="flex-1 h-[2px] bg-white"></div>
          </div>

          {/* Big Image */}
          <img
            src={LeftImage}
            alt="Hyper Tek Main"
            className="w-[90%]  lg:ml-[240px] sm:w-[510px] h-[220px] sm:h-[320px] lg:w-[510px] lg:h-[414px] object-cover lg:absolute lg:max-w-full"
          />
        </div>

        {/* Right Side */}
        <div className="flex flex-col gap-4 w-full lg:w-[663px] mt-8 lg:mt-14 md:ml-36 ">
          {/* Two images side by side */}
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <img
              src={RightImage1}
              alt="Right Image 1"
              className="w-full sm:w-[318px] h-[200px] sm:h-[255px] object-cover"
            />
            <img
              src={RightImage2}
              alt="Right Image 2"
              className="w-full sm:w-[318px] h-[200px] sm:h-[255px] object-cover lg:mr-[100px]"
            />
          </div>

          {/* Paragraph */}
          <p className="text-white text-sm md:text-base leading-relaxed font-inter px-2">
            <span className="font-semibold">The year is 2117.</span> <br /> Humanity
            didn&apos;t conquer the stars—it fractured into them. After
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
    </section>
  );
}
