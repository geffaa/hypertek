import React from "react";
import LeftImage from "../../assets/images/about/about.jpg";
import RightImage1 from "../../assets/images/about/left.jpg";
import RightImage2 from "../../assets/images/about/right.jpg";

export default function HyperTekDesign() {
  return (
    <section className="flex justify-center items-center relative my-16 w-full">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row justify-between items-start px-4 md:px-6 lg:px-8 gap-6">
        {/* Left side */}
        <div className="flex items-center gap-4 relative w-full lg:w-auto">
          {/* Vertical text with lines */}
          <div className="hidden lg:flex flex-col items-center justify-center absolute -left-10 top-1/2 -translate-y-1/2">
            <div className="w-[2px] h-20 bg-white"></div>
            <div
              className="flex items-center justify-center my-3"
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
            >
              <h2 className="font-bold text-sm uppercase tracking-widest text-white">
                HYPER TEK 100
              </h2>
            </div>
            <div className="w-[2px] h-20 bg-white"></div>
          </div>

          {/* Big Image */}
          <img
            src={LeftImage}
            alt="Hyper Tek Main"
            className="w-full max-w-full md:w-[546px] h-[250px] md:h-[414px] object-cover"
          />
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-6 w-full lg:w-[663px]">
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
              className="w-full sm:w-[318px] h-[200px] sm:h-[255px] object-cover"
            />
          </div>

          {/* Paragraph */}
          <p className="text-white text-sm md:text-base leading-relaxed font-inter">
            <span className="font-semibold">The year is 2117.</span> Humanity
            didn&apos;t conquer the stars—it fractured into them. After Earth&apos;s
            collapse, survivors launched the Hyper Tek Exodus, scattering AI,
            enhanced genomes, and prototypes across thousands of seed worlds.
            Each evolved in isolation, forming new species, cultures, and
            technologies. At the center of it all lies the Echo Core, a quantum
            relic now pulsing with riddles, memories, and a call to power. It
            awakens you, a reborn Overlord, forged by legacy and technology.
          </p>
        </div>
      </div>
    </section>
  );
}
