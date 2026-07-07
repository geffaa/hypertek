import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Rocket, X } from "lucide-react";

/**
 * ComingSoonModal — reusable "not yet live" notice.
 *
 * A dismissible pop-up that lets users know a feature will unlock at the
 * official launch. Matches the Hyper Tek sci-fi aesthetic (cyan accents,
 * Orbitron headings, dark glass panel).
 *
 * Props:
 *   isOpen    (bool)   — controls visibility
 *   onClose   (fn)     — called when the user dismisses the modal
 *   title     (string) — optional heading override
 *   message   (string) — optional body copy override
 *   feature   (string) — optional feature name woven into the default copy
 *                        (e.g. "The Marketplace")
 */
const ComingSoonModal = ({ isOpen, onClose, title, message, feature }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const id = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(id);
    }
    setIsVisible(false);
    const id = setTimeout(() => setIsMounted(false), 400);
    return () => clearTimeout(id);
  }, [isOpen]);

  // Close on Escape while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const heading = title || "Almost Here";
  const body =
    message ||
    `${feature ? `${feature} is` : "This experience is"} in final preparation and will go live at our official launch. Back the project now to be among the first through the door.`;

  return createPortal(
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-400 ease-out
        ${isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Panel */}
      <div
        className={`
          relative w-full max-w-md mx-auto p-8 text-center overflow-hidden
          transform transition-all duration-500 ease-out
          ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-6"}
        `}
        style={{
          background: "linear-gradient(160deg,#0b1a2e 0%,#0a121f 100%)",
          border: "1px solid rgba(56,189,248,0.35)",
          borderTop: "2px solid rgba(56,189,248,0.7)",
          borderRadius: "18px",
          boxShadow: "0 0 60px rgba(56,189,248,0.18)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(56,189,248,0.22),transparent 70%)" }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-3.5 right-3.5 w-9 h-9 rounded-full z-10
            flex items-center justify-center text-cyan-200/70
            bg-white/5 border border-cyan-400/20
            hover:bg-cyan-400/10 hover:text-cyan-100
            transition-all duration-200 hover:scale-110 active:scale-95
          "
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div
          className={`
            relative w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
            transform transition-all duration-700 ease-out
            ${isVisible ? "scale-100 rotate-0" : "scale-0 -rotate-12"}
          `}
          style={{
            background: "linear-gradient(140deg,rgba(56,189,248,0.25),rgba(56,189,248,0.05))",
            border: "1px solid rgba(56,189,248,0.4)",
            boxShadow: "0 0 28px rgba(56,189,248,0.25)",
          }}
        >
          <Rocket size={30} className="text-cyan-300" strokeWidth={1.75} />
        </div>

        {/* Badge */}
        <span
          className="inline-block mb-4 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/90 rounded-full"
          style={{
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.3)",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          Coming Soon
        </span>

        {/* Heading */}
        <h2
          className="text-2xl font-bold mb-3 text-white"
          style={{ fontFamily: "Orbitron, sans-serif", letterSpacing: "0.02em" }}
        >
          {heading}
        </h2>

        {/* Body */}
        <p className="text-white/60 text-[15px] leading-relaxed mb-8 max-w-sm mx-auto">
          {body}
        </p>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="px-8 py-3 text-[11px] font-bold uppercase transition-all hover:brightness-125 active:scale-95"
          style={{
            background: "#0b1a2e",
            border: "1px solid rgba(56,189,248,0.5)",
            borderTop: "2px solid rgba(56,189,248,0.75)",
            borderRadius: "12px",
            fontFamily: "Orbitron, sans-serif",
            boxShadow: "0 0 28px rgba(56,189,248,0.15)",
            color: "rgba(56,189,248,0.95)",
            letterSpacing: "0.12em",
          }}
        >
          Got It
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ComingSoonModal;
