import React, { useState, useEffect } from "react";

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
  const [status, setStatus] = useState("loading"); // "loading" | "loaded" | "error"

  // Reset status kalau src berubah
  useEffect(() => {
    if (!src) {
      setStatus("error");
    } else {
      setStatus("loading");
    }
  }, [src]);

  const effectiveSrc =
    status === "error" && fallback ? fallback : src || fallback;

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
        src={effectiveSrc}
        alt={alt}
        loading="lazy"
        className={`w-full h-full transition-opacity duration-500 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
        onLoad={() => setStatus("loaded")}
        onError={(e) => {
          if (fallback && e.target.src !== fallback) {
            e.target.src = fallback;
          }
          setStatus("error");
        }}
        {...imgProps}
      />

      {/* Optional overlay children (badges, gradient, dll.) */}
      {children}
    </div>
  );
}
