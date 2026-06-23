import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiMail, FiCheck } from "react-icons/fi";

import { Gauge, Compass, Crown } from "lucide-react";
import Navbar from "../Components/Common/Navbar";
import Footer from "../Components/Common/Footer";
import bgHero from "../assets/images/waitlist/bg-hero.webp";
import alphabetImg from "../assets/images/waitlist/alphabet.webp";
import character1 from "../assets/images/waitlist/character1.webp";
import character2 from "../assets/images/waitlist/character2.webp";
import logoWhite from "../assets/logo-t-white.png";

const WORLDS = [
  { Icon: Gauge,   key: "racing",   title: "Hyper Racing",   color: "#3B82F6" },
  { Icon: Compass, key: "quest",    title: "Hyper Quest",    color: "#8B5CF6" },
  { Icon: Crown,   key: "overlord", title: "Overlord Realm", color: "#06B6D4" },
];

function Waitlist() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubscribe = () => {
    if (email.trim()) setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#060610] text-white overflow-x-hidden">

      <Navbar />

      {/* ── SECTION 1: HERO ── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={bgHero}
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.75 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #060610 0%, transparent 15%, transparent 80%, #060610 100%)",
            }}
          />
          <motion.div
            className="absolute rounded-full bg-[#002AA8]"
            style={{
              width: "500px", height: "500px",
              top: "25%", left: "35%",
              transform: "translate(-50%, -50%)",
              filter: "blur(120px)", zIndex: 1,
            }}
            animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="relative flex flex-col items-center text-center px-6 max-w-[700px]"
          style={{ zIndex: 2 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-extrabold text-5xl sm:text-6xl md:text-[64px] leading-[1.1] tracking-tight mb-2">
            {t("waitlist.heading1")}
          </h1>
          <h1 className="font-extrabold text-5xl sm:text-6xl md:text-[64px] leading-[1.1] tracking-tight mb-6 mt-2">
            {t("waitlist.heading2")}
          </h1>
          <p className="text-white/75 text-sm sm:text-base md:text-[17px] leading-relaxed mb-10 max-w-[500px]">
            {t("waitlist.subtitle")}
          </p>
          <motion.button
            className="px-10 py-3.5 bg-white text-[#060610] rounded-md text-sm font-bold tracking-wide"
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(255,255,255,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => navigate("/join-waitlist")}
          >
            {t("waitlist.joinBtn")}
          </motion.button>
        </motion.div>
      </section>

      {/* ── SECTION 2: THREE WORLDS ── */}
      <section className="relative w-full bg-[#060610] overflow-hidden py-24 lg:py-0">

        {/* Subtle alphabet decoration */}
        <img
          src={alphabetImg}
          alt=""
          className="absolute top-0 left-0 opacity-20 pointer-events-none select-none"
          style={{ filter: "blur(1px)" }}
        />

        {/* Blue glow left */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "600px", height: "600px",
            top: "50%", left: "-10%",
            transform: "translateY(-50%)",
            background: "radial-gradient(circle, rgba(0,42,168,0.35) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-0 min-h-[100vh] py-16">

          {/* LEFT — character */}
          <motion.div
            className="lg:w-1/2 flex items-center justify-center relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glow behind character */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: "500px", height: "500px",
                background: "radial-gradient(circle, rgba(0,42,168,0.5) 0%, transparent 65%)",
                filter: "blur(20px)",
              }}
            />
            <img
              src={character1}
              alt="Hyper Tek Character"
              className="relative z-10 w-full object-contain"
              style={{ maxHeight: "85vh" }}
            />

          </motion.div>

          {/* RIGHT — content */}
          <div className="lg:w-1/2 flex flex-col gap-8 lg:pl-12">

            {/* Label */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-px w-8 bg-blue-500" />
              <span className="text-blue-400 text-xs font-bold tracking-[0.25em] uppercase">
                {t("waitlist.gameplayHeading")}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="font-[Goldman] text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t("waitlist.universeHeading")}<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4)" }}>
                {t("waitlist.threeWorlds")}
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-white/60 text-sm md:text-[15px] leading-relaxed max-w-[480px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {t("waitlist.gameplayDesc")}
            </motion.p>

            {/* World cards */}
            <div className="flex flex-col gap-3">
              {WORLDS.map((world, i) => (
                <motion.div
                  key={world.key}
                  className="flex items-start gap-4 px-4 py-4 rounded-xl transition-all duration-300 cursor-default group"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  whileHover={{
                    background: "rgba(255,255,255,0.07)",
                    borderColor: `${world.color}40`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${world.color}20`, border: `1px solid ${world.color}40` }}
                  >
                    <world.Icon size={18} style={{ color: world.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white mb-1">{world.title}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{t(`waitlist.worlds.${world.key}.desc`)}</p>
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                    style={{ background: world.color }}
                  />
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: NEWSLETTER CTA ── */}
      <section className="relative w-full overflow-hidden bg-[#060610] py-24 lg:py-32">

        {/* Background image blurred */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={bgHero}
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.12, filter: "blur(4px)", transform: "scale(1.05)" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #060610, transparent 30%, transparent 70%, #060610)" }} />
        </div>

        {/* Glow orbs */}
        <div className="absolute pointer-events-none" style={{ width: "500px", height: "500px", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(0,42,168,0.3) 0%, transparent 65%)", filter: "blur(30px)" }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT — character2 */}
          <motion.div
            className="hidden lg:flex lg:w-2/5 items-end justify-center relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 60%, rgba(0,42,168,0.4) 0%, transparent 65%)", filter: "blur(20px)" }} />
            <img
              src={character2}
              alt="Character"
              className="relative z-10 w-full object-contain"
              style={{ maxHeight: "520px" }}
            />
          </motion.div>

          {/* RIGHT — newsletter form */}
          <motion.div
            className="lg:w-3/5 flex flex-col gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Logo + label */}
            <div className="flex items-center gap-3">
              <img src={logoWhite} alt="Hyper Tek" className="h-14 w-auto opacity-90" />
              <div className="h-4 w-px bg-white/20" />
              <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">
                {t("waitlist.stayInTouch")}
              </span>
            </div>

            {/* Heading */}
            <div>
              <h2 className="font-[Goldman] text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight mb-4">
                {t("waitlist.newsletter")}
              </h2>
              <p className="text-white/55 text-sm md:text-[15px] leading-relaxed max-w-[460px]">
                {t("waitlist.newsletterDesc")}
              </p>
            </div>

            {/* Email form */}
            {!subscribed ? (
              <div className="flex flex-col gap-3 max-w-[480px]">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <FiMail className="text-white/30 shrink-0" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    placeholder={t("waitlist.emailPlaceholder")}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none min-w-0"
                  />
                </div>
                <motion.button
                  onClick={handleSubscribe}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm text-[#060610]"
                  style={{ background: "linear-gradient(135deg, #fff 0%, rgba(200,210,255,0.95) 100%)" }}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("waitlist.subscribe")} <FiArrowRight size={16} />
                </motion.button>
                <p className="text-white/25 text-xs">{t("waitlist.noSpam")}</p>
              </div>
            ) : (
              <motion.div
                className="flex items-center gap-4 px-6 py-5 rounded-xl max-w-[480px]"
                style={{ background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.25)" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <FiCheck size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{t("waitlist.subscribedTitle")}</p>
                  <p className="text-white/50 text-xs mt-0.5">{t("waitlist.subscribedDesc")}</p>
                </div>
              </motion.div>
            )}


            {/* Join CTA */}
            <motion.button
              onClick={() => navigate("/join-waitlist")}
              className="flex items-center gap-2 self-start px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #002AA8, #0050FF)", border: "1px solid rgba(255,255,255,0.1)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(0,42,168,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              {t("waitlist.joinBtn")} <FiArrowRight size={15} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

export default Waitlist;
