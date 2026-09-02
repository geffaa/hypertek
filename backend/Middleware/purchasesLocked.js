// Server-side purchase gate — independent of any frontend UI lock.
//
// Don wants the site to look and behave fully live for marketing/demo purposes
// (browsing, listing, everything visible and clickable), while guaranteeing no
// purchase can actually complete while payment rails, the GMBB Fund contract,
// and the admin panel aren't ready. The frontend's LAUNCH_LOCKED overlay is a
// UI convenience only; it was never enforced server-side, so hiding it alone
// would have let real purchases go through. This middleware is the actual
// enforcement: it rejects purchase-completing requests before they touch any
// business logic, regardless of what the frontend shows.
//
// Controlled by PURCHASES_LOCKED in the environment. Defaults to locked (true)
// if the variable is unset, so a missing/misconfigured env var fails safe.
export function purchasesLocked(req, res, next) {
  const locked = process.env.PURCHASES_LOCKED !== "false";
  if (!locked) return next();
  return res.status(423).json({
    success: false,
    error: "Purchases are not open yet. Browsing and listing are available now; buying will open at official launch.",
    code: "PURCHASES_LOCKED",
  });
}
