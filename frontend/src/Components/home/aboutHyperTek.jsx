import React from "react";
import { motion } from "framer-motion";
import LeftImageDefault from "../../assets/images/about/about.webp";
import RightImage1Default from "../../assets/images/about/left.webp";
import RightImage2Default from "../../assets/images/about/right.webp";
import useSiteContent from "../../hooks/useSiteContent";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: "easeOut" },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Hyper TekDesign() {
  const { t } = useTranslation();
  const { data: cms } = useSiteContent("home_about");

  const verticalLabel = cms.vertical_label || t("about.verticalLabel");
  const title = cms.title || t("about.title");
  const body = cms.body || t("about.body");
  const imageLeft = cms.image_left || LeftImageDefault;
  const imageRight1 = cms.image_right_1 || RightImage1Default;
  const imageRight2 = cms.image_right_2 || RightImage2Default;

  return (
    <section data-edit-section="home_about" data-edit-label="About Section" className="relative w-full px-0 overflow-hidden z-10 pt-16 md:pt-24">
      <div className="max-w-[1450px] mx-auto lg:pr-8 lg:pl-0">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
          {/* LEFT BIG IMAGE (Desktop only) */}
          <motion.div
            className="hidden lg:flex relative bg-[#B0BDE4] items-center justify-center w-[520px] h-[520px]"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Vertical Label */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-[2px] h-20 bg-white" />
              <div className="[writing-mode:vertical-lr] rotate-180 my-3">
                <h2 className="outline-text text-white font-inter font-semibold text-[30px] tracking-widest">
                  {verticalLabel}
                </h2>
              </div>
              <div className="w-[2px] h-20 bg-white" />
            </div>

            {/* Image */}
            <img
              src={imageLeft}
              alt="Hyper Tek Main"
              className="w-[510px] h-[414px] object-cover translate-x-24"
            />
          </motion.div>

          {/* RIGHT CONTENT */}
          <motion.div
            className="flex-1 flex flex-col gap-6 lg:gap-8 mt-6 lg:mt-14 lg:pl-12 xl:pl-20 pr-0"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* TOP IMAGES — flex with equal sizing and gap */}
            <div className="flex gap-4 w-full">
              <motion.img
                src={imageRight1}
                alt="Right Image 1"
                className="flex-1 pl-4 h-[150px] sm:h-[255px] object-cover"
                variants={fadeUp}
                custom={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              />
              <motion.img
                src={imageRight2}
                alt="Right Image 2"
                className="flex-1 h-[150px] sm:h-[255px] object-cover rounded-l-lg rounded-r-none"
                variants={fadeUp}
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              />
            </div>

            {/* TEXT */}
            <motion.div
              className="w-full -mt-6"
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h1 className="text-white pl-4 font-inter font-semibold text-lg md:text-xl mb-2">
                {title}
              </h1>
              <p className="text-white pl-4 pr-5 font-inter text-sm md:text-base leading-relaxed max-w-full">
                {body}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
