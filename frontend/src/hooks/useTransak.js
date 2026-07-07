// useTransak — thin wrapper around @transak/transak-sdk (v4).
//
// Transak deprecated client-side widget URLs built from apiKey+params ("refused to connect").
// The widgetUrl is now minted by OUR backend (POST /api/v1/transak/*/session → Transak
// auth/session API) and embeds a single-use sessionId. This hook only loads that URL.
//
// We render the Transak iframe inside OUR OWN centered modal (via the SDK's `containerId`
// option) so the overlay, sizing and close button are controlled by us — the SDK's default
// full-screen chrome renders a misaligned/clipped close button on some viewports.
//
// v4 relays widget events via a STATIC emitter (Transak.on) with no `off`, so we bind listeners
// once and route them to the currently-open session. Only one widget is open at a time (modal).
import { useCallback } from "react";
import { Transak } from "@transak/transak-sdk";

const CONTAINER_ID = "transak-widget-container";
// Card sizing — responsive: capped in px but shrinks to the viewport on small screens.
const WIDGET_W = 500; // max width (px)
const WIDGET_H = 780; // max height (px)

let active = null; // { instance, overlay, onSuccess, onFailed, onClose }
let listenersBound = false;
let lastOpenedUrl = null; // dedupe: a widgetUrl's sessionId is single-use — never load it twice

function bindListenersOnce() {
  if (listenersBound) return;
  listenersBound = true;
  Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (p) => active?.onSuccess?.(p?.status || p));
  Transak.on(Transak.EVENTS.TRANSAK_ORDER_FAILED, (p) => active?.onFailed?.(p?.status || p));
  Transak.on(Transak.EVENTS.TRANSAK_ORDER_CANCELLED, (p) => active?.onFailed?.(p?.status || p));
  Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
    const cur = active;
    teardown();
    cur?.onClose?.();
  });
}

// Build our own overlay + centered card + close button + iframe container.
function buildOverlay(onCloseClick) {
  const overlay = document.createElement("div");
  overlay.setAttribute("data-transak-overlay", "true");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "2147483000",
    background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    position: "relative",
    width: `min(${WIDGET_W}px, 96vw)`,
    height: `min(${WIDGET_H}px, 94vh)`,
    borderRadius: "20px", overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)", background: "#0f0f2a",
  });

  // Force the Transak-injected iframe to fill our card regardless of its own width/height attrs.
  if (!document.getElementById("transak-iframe-style")) {
    const style = document.createElement("style");
    style.id = "transak-iframe-style";
    style.textContent = `#${CONTAINER_ID} iframe{width:100%!important;height:100%!important;border:0!important;}`;
    document.head.appendChild(style);
  }

  // Close via a backdrop click (clicking the dark area outside the card).
  overlay.onclick = (e) => { if (e.target === overlay) onCloseClick(); };

  // Our own close button — placed TOP-LEFT so it never overlaps Transak's own
  // settings/close controls (which sit top-right inside the iframe).
  const closeBtn = document.createElement("button");
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = "&times;";
  Object.assign(closeBtn.style, {
    position: "absolute", top: "10px", left: "10px", zIndex: "2",
    width: "30px", height: "30px", borderRadius: "9999px", border: "none",
    background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "18px", lineHeight: "1",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  });
  closeBtn.onclick = onCloseClick;

  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  Object.assign(container.style, { width: "100%", height: "100%" });

  card.appendChild(closeBtn);
  card.appendChild(container);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  return overlay;
}

function teardown() {
  try {
    active?.instance?.close?.();
    active?.instance?.cleanup?.();
  } catch { /* no-op */ }
  active?.overlay?.remove?.();
  active = null;
}

export function useTransak() {
  // Open a widget from a backend-minted widgetUrl. Products, wallet, amounts and partnerOrderId
  // are all baked into the URL server-side; here we just render and relay events.
  const openWidget = useCallback(({ widgetUrl, onSuccess, onFailed, onClose }) => {
    if (!widgetUrl) {
      console.error("[Transak] openWidget called without a widgetUrl");
      onFailed?.({ error: "Missing widgetUrl" });
      return () => {};
    }
    // Guard: a widgetUrl's sessionId is single-use. Re-loading the same URL (double-click,
    // StrictMode re-invoke) consumes the token and drops back to Transak's generic widget.
    if (active && lastOpenedUrl === widgetUrl) {
      return teardown;
    }
    bindListenersOnce();
    teardown(); // clear any stale widget
    lastOpenedUrl = widgetUrl;

    const handleClose = () => {
      const cur = active;
      teardown();
      cur?.onClose?.();
    };
    const overlay = buildOverlay(handleClose);

    const instance = new Transak({
      widgetUrl,
      referrer: window.location.origin,
      containerId: CONTAINER_ID,
      widgetWidth: "100%",
      widgetHeight: "100%",
    });
    active = { instance, overlay, onSuccess, onFailed, onClose };
    instance.init();

    return teardown; // caller can force-close
  }, []);

  const closeTransak = useCallback(() => teardown(), []);

  return { openWidget, closeTransak };
}

export default useTransak;
