import React from "react";
import connect from "../../assets/images/howItsWork/connect.png";
import wallet from "../../assets/images/howItsWork/wallet.png";
import card from "../../assets/images/howItsWork/card.png";
import earn from "../../assets/images/howItsWork/earn.png";
import "../../index.css";
import PageBackground from "../Common/BgEffect";
import GlowingOrb from "../Common/BgColoring";

function HowItsWork() {
  const steps = [
    {
      icon: connect,
      title: "Connect Wallet",
      description:
        "Securely connect your crypto wallet to start buying, selling, and collecting NFTs.",
    },
    {
      icon: wallet,
      title: "Explore Collections",
      description:
        "Browse trending collections and discover rare digital artworks from top creators.",
    },
    {
      icon: card,
      title: "Collect & Trade",
      description:
        "Buy your favorite NFTs and showcase or trade them on your profile anytime.",
    },
    {
      icon: earn,
      title: "Earn & Grow",
      description:
        "Earn by selling your collections or gaining popularity in the NFT space.",
    },
  ];

  return (
    <section className="flex flex-col lg:flex-row gap-12 px-4 sm:px-8 md:px-16 py-12 lg:py-16 items-start justify-center relative z-10">
      <GlowingOrb Xaxis={70} Yaxis={190} />
      {/* Left side */}
      <div className="w-full lg:w-[340px] flex flex-col my-auto gap-6 text-white text-center lg:text-left">
        <h2
          className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[120%] tracking-normal"
          style={{ fontFamily: "Goldman" }}
        >
          How It Works
        </h2>
        <p className="text-base sm:text-lg font-normal leading-[150%]">
          Get started in just a few steps <br />
          and unlock the world of <br />
          digital collectibles.
        </p>
      </div>

      {/* Right side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 w-full lg:w-[716px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative flex flex-col items-start p-6 rounded-2xl shadow-md bg-gray-900 overflow-hidden custom-border w-full sm:w-[334px] h-auto sm:h-[252px]"
          >
            <img
              src={step.icon}
              alt={step.title}
              className="w-12 h-12 mb-4 bg-blue-800 rounded-2xl text-white p-2"
            />
            <h3
              className="text-xl sm:text-xl lg:text-xl font-bold mb-2 text-white"
              style={{
                fontFamily: "Goldman",
                width: "100%",
                maxWidth: "220px",
                height: "auto",
              }}
            >
              {step.title}
            </h3>
            <p
              className="text-sm sm:text-sm lg:text-sm text-white leading-[150%]"
              style={{
                width: "100%",
                maxWidth: "254px",
                height: "auto",
              }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItsWork;
