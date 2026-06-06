import React from "react";
import { motion } from "framer-motion";
import connectIcon from "../../assets/images/howItsWork/connect.webp";
import walletIcon from "../../assets/images/howItsWork/wallet.webp";
import cardIcon from "../../assets/images/howItsWork/card.webp";
import earnIcon from "../../assets/images/howItsWork/earn.webp";
import "../../index.css";
import useSiteContent from "../../hooks/useSiteContent";
import { useTranslation } from "react-i18next";

const DEFAULT_STEPS = [
  {
    title: "Connect Wallet",
    description:
      "Securely connect your crypto wallet to start buying, selling, and collecting NFTs.",
  },
  {
    title: "Explore Collections",
    description:
      "Browse trending collections and discover rare digital artworks from top creators.",
  },
  {
    title: "Collect & Trade",
    description:
      "Buy your favorite NFTs and showcase or trade them on your profile anytime.",
  },
  {
    title: "Earn & Grow",
    description:
      "Earn by selling your collections or gaining popularity in the NFT space.",
  },
];

const STEP_ICONS = [connectIcon, walletIcon, cardIcon, earnIcon];

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

function HowItsWork() {
  const { t } = useTranslation();
  const { data: cms } = useSiteContent("home_how_it_works");

  const sectionTitle = cms.section_title || t("howItWorks.sectionTitle");
  const sectionSubtitle = cms.section_subtitle || t("howItWorks.sectionSubtitle");

  const translatedSteps = t("howItWorks.steps", { returnObjects: true });
  const steps = Array.isArray(cms.steps) ? cms.steps : (Array.isArray(translatedSteps) ? translatedSteps : DEFAULT_STEPS);

  return (
    <section data-edit-section="home_how_it_works" data-edit-label="How It Works" className="relative z-10 w-full px-8 md:px-16 py-16 lg:py-20">
      <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-16 items-center">

        {/* Left Section */}
        <motion.div
          className="flex flex-col gap-8 text-white text-center lg:text-left"
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[120%]"
            style={{ fontFamily: "Goldman" }}
          >
            {sectionTitle}
          </h2>

          <p className="text-gray-200 sm:text-lg leading-[150%]">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Right Section - Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 lg:ml-32 max-w-[820px]">

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative flex flex-col items-start p-6 rounded-[40px] shadow-md overflow-hidden custom-border w-full sm:h-[252px]"
              variants={fadeUp}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Icon */}
              <img
                src={STEP_ICONS[index] || STEP_ICONS[0]}
                alt={step.title}
                className="w-12 h-12 mb-4 bg-blue-800 rounded-2xl p-2"
              />

              {/* Title */}
              <h3
                className="text-xl font-bold mb-2 text-white"
                style={{ fontFamily: "Goldman", maxWidth: "220px" }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm text-white leading-[150%]"
                style={{ maxWidth: "254px" }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}

export default HowItsWork;