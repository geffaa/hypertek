import React from "react";
import Hero1 from "../../assets/images/Profile/Hero1.webp";
import useSiteContent from "../../hooks/useSiteContent";
import { BACKEND_BASE_URL } from "../../Config";

/**
 * Full-width profile hero banner — driven by CMS (profile_banner section).
 * Falls back to Hero1.webp if no CMS image is set.
 */
function ProfileBanner() {
  const { data: cms } = useSiteContent("profile_banner");

  let bgImage = Hero1;
  if (cms.background_image) {
    bgImage = cms.background_image.startsWith("http")
      ? cms.background_image
      : `${BACKEND_BASE_URL}${cms.background_image}`;
  }

  return (
    <div
      data-edit-section="profile_banner"
      data-edit-label="Profile Banner"
      className="relative w-full h-[260px] sm:h-[300px] md:h-[269px] lg:h-[269px] overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

export default ProfileBanner;
