import { Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";
import useSiteContent from "../../hooks/useSiteContent";
import { BACKEND_BASE_URL } from "../../Config";

function MarketplaceBanner({ stats = [], titleOverride, descOverride, playing = false, onToggleAudio, noMargin = false }) {
  const { t } = useTranslation();
  const { data: cms } = useSiteContent("marketplace_banner");

  const heading = titleOverride || cms.heading     || t("marketplace.banner.defaultHeading");
  const desc    = descOverride  || cms.description || t("marketplace.banner.defaultDesc");

  let bgImage = "/marketplace_banner.png";
  if (cms.background_image) {
    bgImage = cms.background_image.startsWith("http")
      ? cms.background_image
      : `${BACKEND_BASE_URL}${cms.background_image}`;
  }

  return (
    <div
      data-edit-section="marketplace_banner"
      data-edit-label="Marketplace Banner"
      className={`relative w-full h-[280px] md:h-[320px] lg:h-[400px] shadow-lg flex items-center ${noMargin ? "" : "mb-8"}`}
      style={{
        backgroundImage: `
          linear-gradient(
            to right,
            rgba(0,0,0,0.88) 0%,
            rgba(0,0,0,0.6) 45%,
            rgba(0,0,0,0.2) 70%,
            rgba(0,0,0,0)    100%
          ),
          url(${bgImage})
        `,
        backgroundPosition: "50% 25%",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="px-4 lg:px-12 w-full max-w-[900px]">
        <h1 className="font-inter font-semibold text-2xl md:text-3xl lg:text-[35px] leading-tight text-white mb-1.5">
          {heading}
        </h1>
        <p className="font-inter hidden md:block font-medium text-sm md:text-base lg:text-[16px] leading-relaxed text-white/80 mb-4">
          {desc}
        </p>

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-5 lg:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-base md:text-lg font-semibold text-white">
                  {stat.num}
                </span>
                <span className="text-[11px] md:text-xs font-normal text-white/60">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {onToggleAudio && (
        <button
          onClick={onToggleAudio}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-all duration-200"
          style={{
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
          }}
          title={playing ? t("marketplace.banner.soundOn") : t("marketplace.banner.soundOff")}
        >
          {playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {playing ? t("marketplace.banner.soundOn") : t("marketplace.banner.soundOff")}
          </span>
        </button>
      )}
    </div>
  );
}

export default MarketplaceBanner;
