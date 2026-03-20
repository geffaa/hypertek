import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import { FiUser, FiMail, FiZap, FiGrid, FiEdit3, FiDollarSign, FiArrowRight, FiCheck, FiX, FiArrowLeft } from "react-icons/fi";
import bgHero from "../assets/images/waitlist/bg-hero.png";
import { BACKEND_BASE_URL } from "../Config";

const TOTAL_STEPS = 7;

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
};

const stepMeta = [
  { icon: FiUser,       title: "Let's get to know you" },
  { icon: FiMail,       title: "Add your email" },
  { icon: FiZap,        title: "How excited are you about a universe where three full games are connected into one experience?" },
  { icon: FiGrid,       title: "Which part of HyperTek 100 interests you the most?" },
  { icon: FiEdit3,      title: "What would make HyperTek 100 a 'must-play' game for you?" },
  { icon: FiDollarSign, title: "Would you consider supporting this project when we open our crowdfunding campaign?" },
  { icon: FaXTwitter,   title: "Follow us on X" },
];

function FooterSocials() {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
      <span className="text-white/35 text-xs">Stay Updated</span>
      <div className="flex items-center gap-3">
        <a href="#" className="text-white/35 hover:text-white transition-colors"><FaXTwitter size={14} /></a>
        <a href="#" className="text-white/35 hover:text-white transition-colors"><FaDiscord size={15} /></a>
      </div>
    </div>
  );
}

function NextButton({ onClick, disabled, label = "Next" }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="h-11 w-full rounded-full bg-white text-[#060610] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition disabled:opacity-35 disabled:cursor-not-allowed"
      whileTap={{ scale: 0.97 }}
    >
      {label} <FiArrowRight size={15} />
    </motion.button>
  );
}

export default function WaitlistForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    excitement: null,
    interest: "",
    mustPlay: "",
    crowdfunding: null,
  });

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setStatus(res.ok ? "success" : "failed");
    } catch {
      setStatus("failed");
    } finally {
      setSubmitting(false);
    }
  };

  const { icon: StepIcon, title } = stepMeta[step] || {};

  const stepContent = {
    0: (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-white/60 text-sm">Your Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && formData.name.trim() && goNext()}
            placeholder="Enter your name"
            autoFocus
            className="h-11 px-4 rounded-lg bg-white text-[#060610] text-sm font-medium outline-none placeholder-gray-400"
          />
        </div>
        <NextButton onClick={goNext} disabled={!formData.name.trim()} />
      </div>
    ),
    1: (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-white/60 text-sm">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && formData.email.trim() && goNext()}
            placeholder="you@example.com"
            autoFocus
            className="h-11 px-4 rounded-lg bg-white text-[#060610] text-sm font-medium outline-none placeholder-gray-400"
          />
        </div>
        <NextButton onClick={goNext} disabled={!formData.email.trim()} />
      </div>
    ),
    2: (
      <div className="flex flex-col gap-4">
        <textarea
          value={formData.excitement}
          onChange={e => setFormData(d => ({ ...d, excitement: e.target.value }))}
          placeholder="Share how excited you are..."
          rows={4}
          autoFocus
          className="px-4 py-3 rounded-lg bg-white text-[#060610] text-sm font-medium outline-none placeholder-gray-400 resize-none"
        />
        <NextButton onClick={goNext} disabled={!String(formData.excitement || "").trim()} />
      </div>
    ),
    3: (
      <div className="flex flex-col gap-4">
        <textarea
          value={formData.interest}
          onChange={e => setFormData(d => ({ ...d, interest: e.target.value }))}
          placeholder="Tell us which part interests you most..."
          rows={4}
          autoFocus
          className="px-4 py-3 rounded-lg bg-white text-[#060610] text-sm font-medium outline-none placeholder-gray-400 resize-none"
        />
        <NextButton onClick={goNext} disabled={!formData.interest.trim()} />
      </div>
    ),
    4: (
      <div className="flex flex-col gap-4">
        <textarea
          value={formData.mustPlay}
          onChange={e => setFormData(d => ({ ...d, mustPlay: e.target.value }))}
          placeholder="Tell us what would make it a must-play for you..."
          rows={4}
          autoFocus
          className="px-4 py-3 rounded-lg bg-white text-[#060610] text-sm font-medium outline-none placeholder-gray-400 resize-none"
        />
        <NextButton onClick={goNext} disabled={!formData.mustPlay.trim()} />
      </div>
    ),
    5: (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          {["Yes", "No"].map(opt => (
            <button
              key={opt}
              onClick={() => setFormData(d => ({ ...d, crowdfunding: opt }))}
              className={`flex-1 h-12 rounded-full text-sm font-bold transition-all ${
                formData.crowdfunding === opt
                  ? "bg-white text-[#060610]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <NextButton onClick={goNext} disabled={!formData.crowdfunding} />
      </div>
    ),
    6: (
      <div className="flex flex-col gap-3">
        <a
          href="https://x.com/HyperTek"
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition"
        >
          <FaXTwitter size={15} /> Follow @HyperTek
        </a>
        <motion.button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-11 rounded-full bg-white text-[#060610] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition disabled:opacity-50"
          whileTap={{ scale: 0.97 }}
        >
          {submitting ? "Submitting..." : "Submit"}
        </motion.button>
      </div>
    ),
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">

      {/* Back to Waitlist button — top left */}
      <button
        onClick={() => navigate("/waitlist")}
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
      >
        <FiArrowLeft size={15} /> Back to Waitlist
      </button>

      <div className="absolute inset-0">
        <img
          src={bgHero}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "blur(10px)", transform: "scale(1.06)", opacity: 0.55 }}
        />
        <div className="absolute inset-0 bg-[#060610]/65" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] mx-4 py-10">
        <div
          className="absolute rounded-full bg-[#002AA8] pointer-events-none"
          style={{
            width: "380px",
            height: "380px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            filter: "blur(110px)",
            opacity: 0.5,
          }}
        />

        <motion.div
          className="relative bg-[#080E24] border border-white/10 rounded-2xl px-8 py-8 w-full overflow-hidden"
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {status === "success" && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <FiCheck size={22} className="text-green-400" />
              </div>
              <h2 className="font-bold text-xl leading-snug">You're on the list!</h2>
              <p className="text-white/55 text-sm leading-relaxed">
                Thanks for joining the Hyper Tek waitlist.<br />We'll be in touch.
              </p>
              <button
                onClick={() => navigate("/waitlist")}
                className="mt-1 h-11 w-full rounded-full bg-white text-[#060610] font-semibold text-sm flex items-center justify-center hover:bg-white/90 transition"
              >
                Visit HyperTek Website
              </button>
              <FooterSocials />
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <FiX size={22} className="text-red-400" />
              </div>
              <h2 className="font-bold text-xl">Something went wrong</h2>
              <p className="text-white/55 text-sm leading-relaxed">
                We couldn't submit your form.<br />Please try again.
              </p>
              <button
                onClick={() => setStatus(null)}
                className="mt-1 h-11 w-full rounded-full bg-white text-[#060610] font-semibold text-sm flex items-center justify-center hover:bg-white/90 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/waitlist")}
                className="h-11 w-full rounded-full bg-white/10 border border-white/15 text-white font-semibold text-sm flex items-center justify-center hover:bg-white/20 transition"
              >
                Visit HyperTek Website
              </button>
              <FooterSocials />
            </div>
          )}

          {!status && (
            <>
              <div className="flex justify-center gap-1.5 mb-7">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[3px] rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? "24px" : "10px",
                      background: i <= step ? "white" : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-center mb-5">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/65">
                  <StepIcon size={18} />
                </div>
              </div>

              <h2 className="font-bold text-[17px] leading-snug text-center mb-6 text-white">
                {title}
              </h2>

              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {stepContent[step]}
                </motion.div>
              </AnimatePresence>

              {step > 0 && (
                <button
                  onClick={goBack}
                  className="mt-4 w-full text-white/35 hover:text-white/60 text-xs transition-colors text-center"
                >
                  ← Back
                </button>
              )}

              <FooterSocials />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
