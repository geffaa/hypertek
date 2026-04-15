import { useState, useEffect, useRef } from "react";

/**
 * LazyImage — drop-in wrapper untuk gambar dengan:
 * - Shimmer skeleton saat loading
 * - Fade-in smooth saat gambar selesai load
 * - Fallback otomatis saat error (jaringan lambat / gambar broken)
 * - Native lazy loading (browser hanya fetch saat gambar mendekati viewport)
 *
 * Usage:
 *   <LazyImage
 *     src={url}
 *     alt="desc"
 *     className="h-40 w-full"          ← dimensi & style pada wrapper div
 *     imgClassName="object-cover"       ← class khusus untuk tag <img>
 *     fallback={placeholderImg}
 *   >
 *     {optionalOverlayChildren}
 *   </LazyImage>
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  fallback,
  style,
  children,
  ...imgProps
}) {
  // currentSrc tracks what <img> actually renders — prevents React from
  // resetting src back to a broken URL after onError switches to fallback.
  const [currentSrc, setCurrentSrc] = useState(src || fallback || "");
  const [status, setStatus] = useState(src ? "loading" : "error");
  const imgRef = useRef(null);

  // When src prop changes (e.g. data loads async), reset to new src
  const prevSrc = useRef(src);
  useEffect(() => {
    if (prevSrc.current === src) return;
    prevSrc.current = src;
    if (src) {
      setCurrentSrc(src);
      setStatus("loading");
    } else {
      setCurrentSrc(fallback || "");
      setStatus("error");
    }
  }, [src, fallback]);

  // Handle images already in browser cache — onLoad fires before React
  // attaches the synthetic handler, so we check .complete after mount.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      setStatus("loaded");
    }
  }, [currentSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Shimmer skeleton — tampil selama loading */}
      {status === "loading" && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s infinite linear",
          }}
        />
      )}

      {/* Gambar */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        className={`w-full h-full transition-opacity duration-500 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
        onLoad={() => setStatus("loaded")}
        onError={() => {
          // Use fallback src via React state — never mutate DOM directly,
          // otherwise React reconciler resets img.src back to the broken URL.
          if (fallback && currentSrc !== fallback) {
            setCurrentSrc(fallback);
            // Keep status as "loading" so onLoad fires when fallback loads
          } else {
            setStatus("error");
          }
        }}
        {...imgProps}
      />

      {children}
    </div>
  );
}
