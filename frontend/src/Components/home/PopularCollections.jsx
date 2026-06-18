import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const COMMON_NOTE = `Rewards, Bonuses and or Discounts for donating now.\n\nNOTE: Other than the voucher to be used for in-line games or selected purchases, all other Rewards, Bonuses and or Discounts cannot be combined or used in conjunction with any other promotions.\n\nAll donation packs will include written end credits in the game development.`;

const SPECIAL_CONDITION = `On the successful development and completion of the game/games, every person who donates will receive a minimum value of more than their original investment in rewards or packages to be used within the game/games, and any bonuses or rewards promised for donating will be given once the game/games are released.`;

const PACKAGES = [
  {
    id: 1,
    title: "Recruit",
    tier: "$20 USD",
    image: "/avatar/dryads-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Recruit"',
      "You will receive $35 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Recruit, you will receive 10% Discount on in-game purchases for the first 12 months",
    ],
  },
  {
    id: 2,
    title: "Cadet Rookie Class",
    tier: "$50 USD",
    image: "/avatar/dryads-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Cadet Rookie Class"',
      "You will receive $90 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Cadet Rookie Class, you will receive a bonus of 10% increase in resource gathering",
      "5% Increase in training speed",
      "10% Discount on in-game purchases for the first 12 months",
      '#Elect just to donate $50 to support our mission, and, if you wish, your name will appear in the end credits of the game under the title "Enlisted Honorary Rookie Class"',
    ],
  },
  {
    id: 3,
    title: "Cadet 1st Class",
    tier: "$75 USD",
    image: "/avatar/ophidians-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Cadet 1st Class"',
      "You will receive $125 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Cadet 1st Class, you will receive a bonus of 10% increase in resource gathering",
      "5% Increase in training speed",
      "5% more price money",
      "5% attack and defence increase",
      "10% Discount on in-game purchases for the first 24 months",
    ],
  },
  {
    id: 4,
    title: "Leading Cadet",
    tier: "$100 USD",
    image: "/avatar/ophidians-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Leading Cadet"',
      "You will receive $170 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Leading Cadet, you will receive a bonus of 10% increase in resource gathering",
      "5% Increase in training speed",
      "5% more price money",
      "5% attack and defence increase",
      "10% Discount on in-game purchases for the first 24 months",
    ],
  },
  {
    id: 5,
    title: "Leading Cadet Special Class",
    tier: "$150 USD",
    image: "/avatar/lithionites-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Leading Cadet Special Class"',
      "You will receive $240 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Leading Cadet Special Class, you will receive a bonus of 10% increase in resource gathering",
      "5% Increase in training speed",
      "5% more price money",
      "5% attack and defence increase",
      "15% Discount on in-game purchases for the first 24 months",
    ],
  },
  {
    id: 6,
    title: "Senior Cadet",
    tier: "$250 USD",
    image: "/avatar/lithionites-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Leading Cadet Special Class"',
      "You will receive $390 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Senior Cadet, you will receive a bonus of 15% increase in resource gathering",
      "5% Increase in training speed",
      "10% Increase in health",
      "5% more price money",
      "5% attack and defence increase",
      "20% Discount on in-game purchases for the first 12 months",
      "10% Discount on in-game purchases for a second 12 months",
      '#Elect just to donate $250 to support our mission, if you wish, your name will appear in the end credits of the game under the title "Enlisted Honorary Senior Special Class"',
    ],
  },
  {
    id: 7,
    title: "Senior Cadet Special Class",
    tier: "$300 USD",
    image: "/avatar/geodians-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Senior Cadet Special Class"',
      "You will receive $440 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Senior Cadet Special Class, you will receive a bonus of 15% increase in resource gathering",
      "1.0% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "10% Increase in training speed",
      "10% Increase in health",
      "10% more price money",
      "5% attack and defence increase",
      "5% greater attack size capacity",
      "20% Discount on in-game purchases for the first 12 months",
      "10% Discount on in-game purchases for a second 12 months",
    ],
  },
  {
    id: 8,
    title: "Flight Cadet",
    tier: "$400 USD",
    image: "/avatar/geodians-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Flight Cadet"',
      "You will receive $550 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Flight Lieutenant, you will receive a bonus of 15% increase in resource gathering",
      "1.5% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "15% Increase in training speed",
      "15% Increase in health",
      "10% more price money",
      "5% attack and defence increase",
      "5% greater attack size capacity",
      "1 mega resource packages",
      "1 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150",
      "20% Discount on in-game purchases for the first 12 months",
      "10% Discount on in-game purchases for a second 12 months",
    ],
  },
  {
    id: 9,
    title: "Flight Lieutenant",
    tier: "$500 USD",
    image: "/avatar/marmulus-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Flight Lieutenant"',
      "You will receive $6800 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Flight Lieutenant, you will receive a bonus of 20% increase in resource gathering",
      "1.5% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "20% Increase in training speed",
      "15% Increase in health",
      "15% more price money",
      "8% attack and defence increase",
      "7% greater attack size capacity",
      "Bonus racing parts",
      "1 mega resource packages",
      "1 off world port passes",
      "1 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150",
      "20% Discount on in-game purchases for the first 12 months",
      "10% Discount on in-game purchases for a second 12 months",
      '#Elect just to donate $500 to support our mission, and, if you wish, your name will appear in the end credits of the game under the title "Enlisted Honorary Flight Lieutenant"',
    ],
  },
  {
    id: 10,
    title: "Flight Lieutenant Special Class",
    tier: "$750 USD",
    image: "/avatar/marmulus-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Flight Lieutenant Special Class"',
      "You will receive $1,050 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Flight Lieutenant Special Class, you will receive a bonus of 20% increase in resource gathering",
      "1.5% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "1.0% higher chance of obtaining NFA's or rare items ongoing",
      "20% Increase in training speed",
      "20% Increase in health",
      "15% more price money",
      "10% attack and defence increase",
      "7% greater attack size capacity",
      "Bonus racing parts",
      "1 mega resource packages",
      "1 extra host avatars",
      "1 off world port passes",
      "1 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150",
      "20% Discount on in-game purchases for the first 12 months",
      "10% Discount on in-game purchases for a second 12 months",
    ],
  },
  {
    id: 11,
    title: "Wingman",
    tier: "$1,000 USD",
    image: "/avatar/fawnus-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Wingman"',
      "You will receive $1,480 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Wingman, you will receive a bonus of 25% increase in resource gathering",
      "2.0% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "1.0% higher chance of obtaining NFA's or rare items ongoing",
      "25% Increase in training speed",
      "20% Increase in health",
      "20% more price money",
      "10% attack and defence increase",
      "8% greater attack size capacity",
      "Bonus racing parts",
      "1 mega resource packages",
      "1 mega crystal packages",
      "1 extra host avatars",
      "1 off world port passes",
      "2 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "20% Discount on in-game purchases for the first 12 months",
      "Receive an ongoing further 10% off any purchases within the game/games",
      '#Elect just to donate $1,000 to support our mission, and, if you wish, your name will appear in the end credits of the game under the title "Enlisted Honorary Wingman"',
    ],
  },
  {
    id: 12,
    title: "Wingman Senior Class",
    tier: "$1,500 USD",
    image: "/avatar/fawnus-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Wingman Senior Class"',
      "You will receive $2,200 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Wingman Senior Class, you will receive a bonus of 25% increase in resource gathering",
      "3.0% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "1.5% higher chance of obtaining NFA's or rare items ongoing",
      "30% Increase in training speed",
      "25% Increase in health",
      "20% more price money",
      "15% attack and defence increase",
      "10% greater attack size capacity",
      "1 extra teleportation slot for attacking/defending",
      "Bonus racing parts",
      "1 mega resource packages",
      "1 mega crystal packages",
      "1 extra host avatars",
      "1 off world port passes",
      "2 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "20% Discount on in-game purchases for the first 12 months",
      "Receive an ongoing further 10% off any purchases within the game/games",
    ],
  },
  {
    id: 13,
    title: "Technical Officer",
    tier: "$2,000 USD",
    image: "/avatar/mantasquads-female.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Technical Officer"',
      "You will receive $2,900 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Technical Officer, you will receive a bonus of 25% increase in resource gathering",
      "3.5% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "2.0% higher chance of obtaining NFA's or rare items ongoing",
      "30% Increase in training speed",
      "25% Increase in health",
      "25% more prize money",
      "15% attack and defence increase",
      "10% greater attack size capacity",
      "1 extra teleportation slot for attacking/defending",
      "Bonus racing parts",
      "2 mega resource packages",
      "1 mega crystal packages",
      "2 extra host avatars",
      "2 off-world port passes",
      "3 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "25% Discount on in-game purchases for the first 12 months",
      "Receive an ongoing further 20% off any purchases within the game/games",
      "Personalised Avatar modelled after the donor, appearing across the game",
      "Revenue sharing! Share in up to 2.5% profit pool generated from the sale of in-game packages and NFA's",
      "Exclusive developer access with monthly private updates on the game, development, plus opportunities to provide feedback",
      "Exclusive Quest racer design to be used within the game",
      "Baseball-style collectible card of your exclusive quest race, sent to you with a letter of appreciation",
    ],
  },
  {
    id: 14,
    title: "Team Specialist",
    tier: "$2,500 USD",
    image: "/avatar/mantasquads-male.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Team Specialist"',
      "You will receive $3,300 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Team Specialist, you will receive a bonus of 30% increase in resource gathering",
      "5% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "2.5% higher chance of obtaining NFA's or rare items ongoing",
      "30% Increase in training speed",
      "30% Increase in health",
      "25% more prize money",
      "15% attack and defence increase",
      "10% greater attack size capacity",
      "1 extra teleportation slot for attacking/defending",
      "Bonus racing parts",
      "3 mega resource packages",
      "1 mega crystal packages",
      "2 extra host avatars",
      "2 off-world port passes",
      "2 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "1 NFA Exceptional team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $400 each",
      "25% Discount on in-game purchases for the first 24 months",
      "Receive an ongoing further 20% off any purchases within the game/games",
      "Personalised Avatar modelled after the donor, appearing across the game",
      "Revenue sharing! Share in up to 2.5% profit pool generated from the sale of in-game packages and NFA's",
      "Exclusive developer access with monthly private updates on the game, development, plus opportunities to provide feedback",
      "Exclusive Quest racer design to be used within the game",
      "Baseball-style collectible card of your exclusive quest race, sent to you with a letter of appreciation",
      '#Elect just to donate $2,500 to support our mission and, if you wish, your name will appear in the end credits of the game under the title "Enlisted Honorary Team Specialist"',
    ],
  },
  {
    id: 15,
    title: "Team Specialist Major",
    tier: "$5,000 USD",
    image: "/avatar/team-specialist-major.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Team Specialist Major"',
      "You will receive $6,500 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As a Team Specialist Major, you will receive a bonus of 35% increase in resource gathering/mining",
      "7% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "3.5% higher chance of obtaining NFA's or rare items ongoing",
      "35% Increase in training speed",
      "30% Increase in health",
      "30% more prize money",
      "20% attack and defence increase",
      "10% greater attack size capacity",
      "1 extra teleportation slot for attacking/defending",
      "Bonus racing parts",
      "4 mega resource packages",
      "1 mega crystal packages",
      "2 extra host avatars",
      "2 off-world port passes",
      "3 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "1 NFA Exceptional team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $400 each",
      "25% Discount on in-game purchases for the first 24 months",
      "Receive an ongoing further 20% off any purchases within the game/games",
      "Personalised Avatar modelled after the donor, appearing across the game",
      "Revenue sharing! Share in up to 5% profit pool generated from the sale of in-game packages and NFA's",
      "Exclusive developer access with monthly private updates on the game, development, plus opportunities to provide feedback",
      "Exclusive Quest racer design to be used within the game",
      "Baseball-style collectible card of your exclusive quest race, sent to you with a letter of appreciation",
    ],
  },
  {
    id: 16,
    title: "Commandar Elite",
    tier: "$7,500 USD",
    image: "/avatar/commander-elite.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Commandar Elite"',
      "You will receive $9,000 USD credits to be used for in-game purchases",
      "You will receive weekly updates on the game via email",
      "You will be able to join discord chat.",
      "As a Commander Elite, you will receive a bonus of 35% increase in resource gathering/mining",
      "7.5% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "4% higher chance of obtaining NFA's or rare items ongoing",
      "40% Increase in training speed",
      "35% Increase in health",
      "30% more price money",
      "20% attack and defence increase",
      "20% greater attack size capacity",
      "2 extra teleportation slots for attacking/defending",
      "Bonus racing parts",
      "4 mega resource packages",
      "2 mega crystal packages",
      "2 extra host avatars",
      "3 off world port passes",
      "4 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "1 NFA Exceptional team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $400 each",
      "30% Discount on in game purchases for the first 12 months",
      "25% Discount on in game purchases for the second 12 months",
      "Receive an ongoing further 20% off any purchases within the game/games",
      "Personalised Avatar modelled after the donor, appearing across the game",
      "Revenue sharing! Share in up to 5% profit pool generated from the sale of in-game packages and NFA's",
      "Exclusive developer access with monthly private updates on the game, development, plus opportunities to provide feedback",
      "Exclusive Quest racer design to be used within the game",
      "Baseball-style collectible card of your exclusive quest race, sent to you with a letter of appreciation",
    ],
  },
  {
    id: 17,
    title: "Over Lord",
    tier: "$10,000 USD",
    image: "/avatar/overlord.webp",
    rewards: [
      'Your name will appear in the end credits of the game under the title "Over Lord"',
      "You will receive $15,000 USD credits to be used for in-game purchases (can not be turned into cash-out payments)",
      "You will receive weekly updates on the game via email",
      "You will be able to join the Discord chat.",
      "As an Overlord, you will receive a bonus of 40% increase in resource gathering/mining",
      "10% Higher chance of obtaining NFA's or rare items within the first 12 months",
      "5% higher chance of obtaining NFA's or rare items ongoing",
      "50% Increase in training speed",
      "40% Increase in health",
      "40% more prize money",
      "25% attack and defence increase",
      "25% greater attack size capacity",
      "2 extra teleportation slots for attacking/defending",
      "Bonus racing parts",
      "6 mega resource packages",
      "3 mega crystal packages",
      "2 extra host avatars",
      "4 off-world port passes",
      "4 NFA Superior team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $150 each",
      "2 NFA Legendary team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $650 each",
      "1 NFA Epic team specialists offering ship and racing bonuses, as well as a guaranteed minimum buy-back of $1000 each",
      "40% Discount on in-game purchases for the first 12 months",
      "30% Discount on in-game purchases for the second 12 months",
      "Receive a further 20% off any purchases within the game/games for as long as you are involved in the game",
      "Personalised Avatar modelled after the donor, appearing across the game",
      "Revenue sharing! Share in up to 5% profit pool generated from the sale of in-game packages and NFA's",
      "Exclusive developer access with monthly private updates on the game, development, plus opportunities to provide feedback",
      "Exclusive Quest racer design to be used within the game",
      "Baseball-style collectible card of your exclusive quest race, sent to you with a letter of appreciation",
    ],
  },
];

// ── Detail Modal ───────────────────────────────────────────────────────────────
function PackageModal({ pkg, onClose }) {
  const { t } = useTranslation();
  if (!pkg) return null;

  return createPortal(
    <AnimatePresence>
      <style>{`
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: #002AA8; border-radius: 4px; }
        .modal-scroll::-webkit-scrollbar-thumb:hover { background: #4A90D9; }
      `}</style>
      <motion.div
        className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          className="modal-scroll relative z-10 w-full max-w-2xl overflow-y-auto rounded-xl"
          style={{
            background: "linear-gradient(135deg, #0d1b3e 0%, #0a0f1e 100%)",
            border: "1px solid rgba(255,255,255,0.2)",
            maxHeight: "min(88vh, 720px)",
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center gap-5 p-5 pb-4"
            style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #0a0f1e 100%)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            {pkg.image ? (
              <img
                src={pkg.image}
                alt={pkg.title}
                loading="lazy"
                className="w-20 h-20 object-cover object-top rounded-lg flex-shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
              />
            ) : (
              <div className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" }}>
                <span className="text-white/30 text-3xl">?</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-white/50 text-[11px] font-bold tracking-widest uppercase">{t("packages.donationTierLabel")}</span>
              <h2 className="text-white font-[Goldman] font-bold text-lg sm:text-xl leading-tight">{pkg.title}</h2>
              <span className="text-[#7EC8A0] text-xl sm:text-2xl font-bold font-[Goldman]">{pkg.tier}</span>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-base w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 p-5">

            {/* Rewards */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-widest">{t("packages.rewardsTitle")}</h3>
              <ul className="flex flex-col gap-2">
                {pkg.rewards.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-white/80 text-[13px] leading-relaxed">
                    <span className="mt-[3px] flex-shrink-0 text-[#7EC8A0]">✦</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-white/10" />

            {/* Note */}
            <div className="flex flex-col gap-2">
              <h4 className="text-white/50 text-[11px] font-bold uppercase tracking-widest">{t("packages.noteTitle")}</h4>
              <p className="text-white/50 text-[12px] leading-relaxed whitespace-pre-line">{t("packages.commonNote")}</p>
            </div>

            {/* Special Condition */}
            <div className="rounded-lg p-4 flex flex-col gap-2"
              style={{ background: "rgba(126,200,160,0.08)", border: "1px solid rgba(126,200,160,0.25)" }}>
              <h4 className="text-[#7EC8A0] text-[11px] font-bold uppercase tracking-widest">{t("packages.specialConditionTitle")}</h4>
              <p className="text-white/70 text-[12px] leading-relaxed">{t("packages.specialCondition")}</p>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function CrowdfundingPackages({ showPageLink = false }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const CARDS_PER_PAGE = 6;
  const totalPages = Math.ceil(PACKAGES.length / CARDS_PER_PAGE);
  const visible = PACKAGES.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  return (
    <section className="relative z-10 w-full px-6 pb-16">
      <div className="mx-auto max-w-[1400px]">

        {/* ── Unified container: header text + packages grid ── */}
        <motion.div
          variants={fadeUp} custom={0}
          initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="overflow-hidden rounded-xl"
          style={{
            background: "linear-gradient(160deg, rgba(0,40,120,0.22) 0%, rgba(0,10,40,0.55) 100%)",
            border: "1px solid rgba(56,189,248,0.22)",
            borderTop: "2px solid rgba(56,189,248,0.5)",
            boxShadow: "0 0 50px rgba(56,189,248,0.08)",
          }}
        >
          {/* ── Header: crowdfunding intro text ── */}
          <div className="px-8 py-7 flex flex-col gap-4">

            {/* Badge */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span style={{ fontFamily: "Orbitron,sans-serif", fontSize: 13, letterSpacing: "0.28em", color: "rgba(56,189,248,1)", fontWeight: "bold", textShadow: "0 0 14px rgba(56,189,248,0.7)" }}>
                {t("packages.badge")}
              </span>
            </div>

            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro1")}
            </p>
            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro2")}
            </p>
            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro3")}
            </p>
            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro4")}
            </p>
            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro5")}
            </p>

            {/* Key Points subheading */}
            <h3 className="text-white font-bold text-[14px] lg:text-[15px] mt-1" style={{ fontFamily: "Orbitron,sans-serif", letterSpacing: "0.04em" }}>
              {t("packages.keyPointsTitle")}
            </h3>
            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro6")}
            </p>
            <p className="text-[13px] lg:text-[14px] leading-[1.85] text-justify" style={{ color: "rgba(255,255,255,0.78)" }}>
              {t("packages.intro7")}
            </p>
          </div>

          {/* ── Divider with section heading ── */}
          <div
            className="px-8 py-4 flex items-center gap-4"
            style={{ borderTop: "1px solid rgba(56,189,248,0.2)", background: "rgba(56,189,248,0.04)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-[2px] bg-white/50" />
              <span className="text-white/70 font-bold text-xs tracking-[0.3em] uppercase">{t("packages.collectionsLabel")}</span>
            </div>
            <div className="flex-1 h-px" style={{ background: "rgba(56,189,248,0.15)" }} />
            <h2 className="text-white font-[Goldman] font-bold text-xl sm:text-2xl uppercase whitespace-nowrap">
              {t("packages.sectionTitle")}
            </h2>
            <div className="flex-1 h-px" style={{ background: "rgba(56,189,248,0.15)" }} />
            <span className="text-white/50 text-[12px] font-semibold whitespace-nowrap">
              {t("packages.discount")}
            </span>
          </div>

          {/* ── Packages grid ── */}
          <div className="px-8 pb-8 pt-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {visible.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  className="rounded-xl overflow-hidden flex flex-col cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  variants={fadeUp} custom={index + 1}
                  initial="hidden" whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => setSelected(pkg)}
                >
                  <div
                    className="relative overflow-hidden flex items-end justify-center bg-[rgba(255,255,255,0.04)]"
                    style={{ height: "160px" }}
                  >
                    {pkg.image ? (
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <span className="text-white/20 text-4xl">?</span>
                        <span className="text-white/20 text-[10px]">{t("packages.imageComing")}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="flex flex-col gap-1 px-3 py-2.5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <h3 className="text-white font-bold text-[12px] leading-snug line-clamp-2">
                      {pkg.title}
                    </h3>
                    <span className="text-[#7EC8A0] text-[11px] font-semibold">
                      {t("packages.donationTierPrefix")} {pkg.tier}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: page === i ? "24px" : "8px",
                      height: "8px",
                      background: page === i ? "#fff" : "rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  ›
                </button>
              </div>
            </div>

            {/* ── Entry CTA → dedicated Crowdfunding page (home only) ── */}
            {showPageLink && (
              <Link
                to="/crowdfunding"
                onClick={() => window.scrollTo(0, 0)}
                className="group mt-1 flex items-center justify-between gap-4 rounded-xl px-5 py-4 transition-all duration-200 hover:brightness-125"
                style={{
                  background: "linear-gradient(135deg, rgba(56,189,248,0.14) 0%, rgba(56,189,248,0.04) 100%)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  borderTop: "2px solid rgba(56,189,248,0.7)",
                  boxShadow: "0 0 28px rgba(56,189,248,0.1)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-white font-bold text-[14px] sm:text-[15px]" style={{ fontFamily: "Orbitron,sans-serif", letterSpacing: "0.04em" }}>
                    {t("packages.pageLinkTitle")}
                  </span>
                  <span className="text-white/55 text-[12px] leading-snug">
                    {t("packages.pageLinkSubtitle")}
                  </span>
                </div>
                <span
                  className="flex items-center gap-2 whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.12em] text-cyan-300 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ fontFamily: "Orbitron,sans-serif" }}
                >
                  {t("packages.pageLinkCta")} <span className="text-base leading-none">→</span>
                </span>
              </Link>
            )}
          </div>

        </motion.div>
      </div>

      {selected && <PackageModal pkg={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

export default CrowdfundingPackages;
