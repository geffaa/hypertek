import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import Logo from "../assets/logo1.png";
import bgHero from "../assets/images/waitlist/bg-hero.png";
import alphabetImg from "../assets/images/waitlist/alphabet.png";
import character1 from "../assets/images/waitlist/character1.png";
import character2 from "../assets/images/waitlist/character2.png";
import worldText from "../assets/images/waitlist/world-text.png";
import platformImg from "../assets/images/waitlist/platform.png";
import vectorImg from "../assets/images/waitlist/vector.png";
import tabImg from "../assets/images/waitlist/tab.png";

function Waitlist() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060610] text-white overflow-x-hidden">

      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[1100px] flex items-center gap-3">
          <nav className="flex-1 flex items-center h-[52px] rounded-full bg-white/10 backdrop-blur-xl border border-white/20 px-5 overflow-hidden">
            <img src={Logo} alt="Hyper Tek" className="w-7 h-7 flex-shrink-0" />
            <span className="flex-1 text-center font-bold text-[15px] tracking-[0.25em] text-white">
              HYPER TEK
            </span>
            <div className="flex items-center gap-4 flex-shrink-0">
              <a href="#" aria-label="X / Twitter" className="text-white/70 hover:text-white transition-colors">
                <FaXTwitter size={17} />
              </a>
              <a href="#" aria-label="Discord" className="text-white/70 hover:text-white transition-colors">
                <FaDiscord size={19} />
              </a>
            </div>
          </nav>
          <div className="flex-shrink-0 h-[52px] px-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center">
            <a href="#" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
              Docs
            </a>
          </div>
          <div className="hidden sm:flex flex-shrink-0 h-[52px] px-5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 items-center gap-1.5">
            <span className="text-[22px] font-extrabold text-white leading-none">2000</span>
            <span className="text-xs font-medium text-white/70 whitespace-nowrap">early movers</span>
          </div>
        </div>
      </div>

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
              width: "500px",
              height: "500px",
              top: "25%",
              left: "35%",
              transform: "translate(-50%, -50%)",
              filter: "blur(120px)",
              zIndex: 1,
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
            Enter the Hyper Tek
          </h1>
          <h1 className="font-extrabold text-5xl sm:text-6xl md:text-[64px] leading-[1.1] tracking-tight mb-6 mt-2">
            Waitlist
          </h1>
          <p className="text-white/75 text-sm sm:text-base md:text-[17px] leading-relaxed mb-10 max-w-[500px]">
            Join the first wave of builders, gamers, and innovators shaping
            Hyper Tek before the world catches up.
          </p>
          <motion.button
            className="px-10 py-3.5 bg-white text-[#060610] rounded-md text-sm font-bold tracking-wide"
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(255,255,255,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => navigate("/join-waitlist")}
          >
            Join the Waitlist
          </motion.button>
        </motion.div>
      </section>

      <section className="relative w-full bg-[#060610] overflow-hidden min-h-screen">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-start pl-[10%]">
          <img src={vectorImg} alt="" className="opacity-80" />
        </div>

        <img
          src={alphabetImg}
          alt=""
          className="absolute top-8 left-8 opacity-40 pointer-events-none select-none z-10"
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch min-h-screen">
          <div className="flex-1 flex flex-col justify-center pt-24 lg:pt-16 pb-8 px-8 md:px-16 lg:px-20 gap-10">
            <div className="max-w-[520px] mx-auto w-full flex flex-col items-center">
              <h2 className="font-bold text-2xl md:text-[32px] mb-5 text-center w-full">Game Play</h2>
              <img src={platformImg} alt="" className="w-[55%] my-4" />
              <p className="text-white/85 text-sm md:text-[15px] leading-relaxed text-center">
                HyperTek 100 is a living universe that evolves with every choice you
                make. Explore new worlds, complete quests, race across off-world
                tracks, or command armies in massive battles and watch your legacy
                grow. Upgrade your ships, vehicles, troops, and bases as you forge
                your path across three connected worlds: Hyper Racing, Hyper Quest,
                and Overlord Realm. Progress in one unlocks power in the others,
                creating a seamless multi-game adventure built to pull you in from
                the moment you enter.
              </p>
              <img src={worldText} alt="WORLD" className="h-6 opacity-85 self-start mt-8" />
            </div>

            <motion.img
              src={tabImg}
              alt="Beginning | Achievements | Creations | Games"
              className="hidden lg:block w-full object-contain ml-24"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            />
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center relative">
            <motion.img
              src={character1}
              alt="Characters"
              className="w-full object-contain"
              style={{ maxHeight: "85vh" }}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden">
        <div className="flex flex-row min-h-[360px] lg:min-h-[600px]">
          <div className="w-2/5 lg:w-1/2 relative flex items-center justify-center">
            <div
              className="absolute rounded-full bg-[#002AA8] pointer-events-none"
              style={{
                width: "400px",
                height: "400px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                filter: "blur(50px)",
                opacity: 0.45,
              }}
            />
            <motion.img
              src={character2}
              alt="Character"
              className="relative object-contain z-10 w-full h-full"
              style={{ maxHeight: "640px" }}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>

          <div className="w-3/5 lg:w-1/2 flex items-center justify-center py-8 px-4 md:px-10">
            <div className="w-full max-w-[440px]">
              <p className="text-white/50 text-xs sm:text-sm mb-2">Want to stay in touch?</p>
              <h2 className="font-bold text-lg sm:text-2xl md:text-[30px] tracking-widest mb-3 sm:mb-5 uppercase">
                Newsletter Subscribe
              </h2>
              <p className="hidden sm:block text-white/55 text-sm md:text-[15px] leading-relaxed mb-8">
                In order to start receiving our news, all you have to do is enter your email
                address. Everything else will be taken care of by us. We will send you
                emails containing information about game. We don't spam.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 h-[38px] sm:h-[44px] px-3 bg-white/5 border border-white/20 rounded text-xs sm:text-sm text-white placeholder-white/30 outline-none focus:border-white/50 transition-colors min-w-0"
                />
                <button className="h-[38px] sm:h-[44px] px-3 sm:px-6 bg-white text-[#060610] rounded text-xs sm:text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap flex-shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#060610] border-t border-white/5 px-6 md:px-12 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={Logo} alt="Logo" className="w-12 h-12 opacity-60" />
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-white/50 text-xs">
            {["Marketplace", "News", "Whitepaper", "FAQ", "Disclaimer", "Terms & Conditions"].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/50 hover:text-white transition-colors"><FaDiscord size={16} /></a>
            <a href="#" className="text-white/50 hover:text-white transition-colors"><FaXTwitter size={15} /></a>
          </div>
        </div>
        <p className="text-center text-white/25 text-xs mt-6">© 2025. All Right Reserved</p>
      </footer>

    </div>
  );
}

export default Waitlist;
