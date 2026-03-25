import { useState, useEffect } from "react";

/**
 * Returns true when device is in landscape orientation
 * AND screen height < 500px (mobile phone landscape).
 */
export default function useMobileLandscape() {
  const check = () =>
    typeof window !== "undefined" &&
    window.innerHeight < 500 &&
    window.innerWidth > window.innerHeight;

  const [isMobile, setIsMobile] = useState(check);

  useEffect(() => {
    const handler = () => setIsMobile(check());
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, []);

  return isMobile;
}
