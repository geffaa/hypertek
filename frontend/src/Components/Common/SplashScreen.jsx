import { motion, AnimatePresence } from "framer-motion";
const logo = "/logo-white.png";

export default function SplashScreen({ onDone }) {
  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onAnimationComplete={() => {
          // We trigger exit via the parent removing us; this is just the enter
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#060610",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Orb top-left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "rgba(0, 42, 168, 0.3)",
            filter: "blur(500px)",
            top: "-15%",
            left: "-15%",
            pointerEvents: "none",
          }}
        />
        {/* Orb bottom-right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "rgba(0, 42, 168, 0.3)",
            filter: "blur(500px)",
            bottom: "-15%",
            right: "-15%",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Glow ring behind logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0.3], scale: [0.8, 1.3, 1.1] }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
            style={{
              position: "absolute",
              inset: "-40px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,42,168,0.5) 0%, transparent 70%)",
              filter: "blur(20px)",
              zIndex: 0,
            }}
          />

          <motion.img
            src={logo}
            alt="Hyper Tek"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{
              width: "160px",
              height: "auto",
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 0 24px rgba(0, 80, 255, 0.6))",
            }}
          />
        </motion.div>

        {/* Fade-out overlay triggered after delay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.2, ease: "easeInOut" }}
          onAnimationComplete={onDone}
          style={{
            position: "absolute",
            inset: 0,
            background: "#060610",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
