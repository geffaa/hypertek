import { Volume2, VolumeX } from "lucide-react";
import overview1 from "../../assets/images/Overview/overview1.jpg";
import useSiteContent from "../../hooks/useSiteContent";
import { BACKEND_BASE_URL } from "../../Config";

/**
 * Full-width marketplace hero banner — driven by CMS (marketplace_banner section).
 *
 * Props:
 *   stats        — array of { num, label } shown at the bottom-left
 *   titleOverride — if provided, replaces the CMS heading (used for category pages)
 *   descOverride  — if provided, replaces the CMS description
 *   playing       — boolean, current audio state (controlled by parent)
 *   onToggleAudio — callback to toggle ambient sound
 */
function MarketplaceBanner({ stats = [], titleOverride, descOverride, playing = false, onToggleAudio, noMargin = false }) {
  const { data: cms } = useSiteContent("marketplace_banner");

  const heading = titleOverride || cms.heading     || "A New Era Dawns in Hyper Tek";
  const desc    = descOverride  || cms.description || "It's the start of a living, breathing universe where every decision shapes the journey.";

  let bgImage = overview1;
  if (cms.background_image) {
    bgImage = cms.background_image.startsWith("http")
      ? cms.background_image
      : `${BACKEND_BASE_URL}${cms.background_image}`;
  }

  return (
    <div
      className={`relative w-full h-60 md:h-72 lg:h-[280px] shadow-lg ${noMargin ? "" : "mb-8"}`}
      style={{
        backgroundImage: `
          linear-gradient(
            to right,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.55) 40%,
            rgba(0,0,0,0.15) 65%,
            rgba(0,0,0,0)    100%
          ),
          url(${bgImage})
        `,
        backgroundPosition: "50% 8.5%",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Heading + Description */}
      <div className="absolute top-4 left-4 lg:top-5 lg:left-12 w-[90%] lg:w-[860px]">
        <h1 className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] leading-tight text-white mb-2">
          {heading}
        </h1>
        <p className="font-inter hidden md:block font-medium text-sm md:text-base lg:text-[18px] leading-relaxed text-white/90">
          {desc}
        </p>
      </div>

      {/* Audio toggle — top right */}
      {onToggleAudio && (
        <button
          onClick={onToggleAudio}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-all duration-200"
          style={{
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
          }}
          title={playing ? "Mute ambient sound" : "Play ambient sound"}
        >
          {playing
            ? <Volume2 className="w-4 h-4" />
            : <VolumeX className="w-4 h-4" />
          }
          <span className="hidden sm:inline">{playing ? "Sound On" : "Sound Off"}</span>
        </button>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div className="absolute bottom-6 left-4 lg:bottom-auto lg:top-[185px] lg:left-12 flex flex-wrap gap-4 lg:gap-[18px]">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-sm md:text-[16px] md:w-[86px] font-medium text-white">
                {stat.num}
              </span>
              <span className="text-xs md:text-[12px] font-normal text-white/80">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MarketplaceBanner;
