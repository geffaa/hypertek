/**
 * LazyImage — drop-in replacement for <img> with:
 *  • loading="lazy" for deferred fetch
 *  • spinner overlay while loading
 *  • smooth fade-in on load
 *  • silent onError fallback
 *
 * Usage (same props as <img>):
 *   <LazyImage src="/bg.png" alt="" style={{ width:"100%", height:"100%" }} />
 *
 * For full-screen backgrounds pass wrapStyle to control the wrapper div;
 * the img itself gets position:absolute inset:0 by default when isCover=true.
 */

import { useState } from "react";

const SPINNER_CSS = `
  @keyframes liSpin {
    to { transform: rotate(360deg); }
  }
  .li-spinner {
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 3px solid rgba(0,212,255,0.12);
    border-top-color: rgba(0,212,255,0.7);
    animation: liSpin 0.9s linear infinite;
  }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = SPINNER_CSS;
  document.head.appendChild(el);
  cssInjected = true;
}

/**
 * @param {object}  props
 * @param {string}  props.src
 * @param {string}  [props.alt]
 * @param {object}  [props.style]        — passed to the <img>
 * @param {object}  [props.wrapStyle]    — overrides wrapper div style
 * @param {string}  [props.spinnerColor] — e.g. "#f87171" for red accent
 * @param {function}[props.onError]      — extra callback on error
 * @param {boolean} [props.isCover]      — if true, img fills wrapper (default true)
 */
export default function LazyImage({
  src,
  alt = "",
  style = {},
  wrapStyle = {},
  spinnerColor,
  onError,
  isCover = true,
  ...rest
}) {
  injectCSS();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleError = (e) => {
    setErrored(true);
    onError?.(e);
  };

  // Wrapper inherits position/size from wrapStyle; falls back to common pattern
  const wrapBase = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    ...wrapStyle,
  };

  // Spinner placeholder — only while loading and not errored
  const showSpinner = !loaded && !errored;

  // Image base style
  const imgStyle = isCover
    ? {
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.45s ease",
        ...style,
      }
    : {
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.35s ease",
        ...style,
      };

  return (
    <div style={wrapBase}>
      {/* ── Spinner shown while image loads ── */}
      {showSpinner && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,5,15,0.55)",
          zIndex: 1,
        }}>
          <div
            className="li-spinner"
            style={spinnerColor ? {
              borderColor: `${spinnerColor}22`,
              borderTopColor: `${spinnerColor}bb`,
            } : undefined}
          />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        style={imgStyle}
        {...rest}
      />
    </div>
  );
}
