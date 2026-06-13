import { useState, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const NAV_H = 72;

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedBlob(image, canvas, crop, fileName) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width  = Math.floor(crop.width  * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  const ctx = canvas.getContext("2d");
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    crop.width * scaleX, crop.height * scaleY
  );

  return new Promise((resolve) =>
    canvas.toBlob(
      (blob) => resolve(new File([blob], fileName, { type: "image/jpeg" })),
      "image/jpeg", 0.92
    )
  );
}

const CROP_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "Free", value: null },
];

// originalFile — the raw File before any crop; used for the "Use Original" shortcut
export default function ImageCropModal({ src, fileName, originalFile, onConfirm, onCancel }) {
  const imgRef    = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  const [crop,          setCrop]          = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect,        setAspect]        = useState(1);

  const onImageLoad = useCallback((e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setCrop(centerAspectCrop(w, h, 1));
  }, []);

  const handleAspect = (val) => {
    setAspect(val);
    if (imgRef.current) {
      const { naturalWidth: w, naturalHeight: h } = imgRef.current;
      if (val !== null) setCrop(centerAspectCrop(w, h, val));
    }
  };

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    const file = await getCroppedBlob(imgRef.current, canvasRef.current, completedCrop, fileName);
    onConfirm(file);
  };

  const availHpx = window.innerHeight - NAV_H - 32;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ top: NAV_H, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="flex flex-col rounded-2xl border border-white/10 p-4 w-full"
        style={{ background: "#0f1117", width: "min(560px, 95vw)", maxHeight: availHpx, gap: 10 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="text-white font-semibold text-sm">Crop Image</span>
          <button onClick={onCancel} className="text-white/50 hover:text-white text-lg leading-none">×</button>
        </div>

        {/* Ratio tabs */}
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          {CROP_RATIOS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleAspect(value)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                aspect === value
                  ? "border-blue-500 bg-blue-500/20 text-blue-400"
                  : "border-white/10 text-white/50 hover:border-white/25"
              }`}
            >{label}</button>
          ))}

          {/* "Use Original" — bypass crop entirely */}
          <button
            onClick={() => onConfirm(originalFile)}
            className="px-3 py-1 rounded-md text-xs font-medium border border-white/10 text-white/50 hover:border-green-500/60 hover:text-green-400 transition-all ml-auto"
          >
            Use Original (no crop)
          </button>
        </div>

        {/* Crop area — scrollable for tall portrait images */}
        <div
          className="overflow-auto flex items-start justify-center"
          style={{ flex: 1, minHeight: 120, maxHeight: availHpx - 130 }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect ?? undefined}
            minWidth={20}
            style={{ maxWidth: "100%", display: "flex" }}
          >
            <img
              ref={imgRef}
              src={src}
              alt="crop-preview"
              onLoad={onImageLoad}
              style={{ display: "block", maxWidth: "100%", userSelect: "none" }}
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm transition-all"
          >Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop?.width}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-all"
          >Crop & Use →</button>
        </div>
      </div>
    </div>
  );
}
