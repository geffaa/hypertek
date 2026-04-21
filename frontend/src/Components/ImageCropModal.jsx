import { useState, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const NAV_H = 72; // navbar height offset

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

const RATIOS = [
  { label: "1:1",  value: 1 },
  { label: "4:3",  value: 4 / 3 },
  { label: "Free", value: null },
];

// Fixed chrome heights: header(~40) + ratio tabs(~32) + actions(~44) + gaps(~24) + padding(~40)
const CHROME_H = 180;

export default function ImageCropModal({ src, fileName, onConfirm, onCancel }) {
  const imgRef    = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  const [crop,         setCrop]         = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect,       setAspect]       = useState(1);

  const onImageLoad = useCallback((e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setCrop(centerAspectCrop(w, h, aspect ?? (w / h)));
  }, [aspect]);

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

  // Available viewport height minus navbar and some padding
  const availH = `calc(100vh - ${NAV_H + 32}px)`;
  const cropAreaH = `calc(100vh - ${NAV_H + CHROME_H + 32}px)`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        top: NAV_H,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="flex flex-col rounded-2xl border border-white/10 p-4 w-full"
        style={{
          background: "#0f1117",
          width: "min(560px, 95vw)",
          maxHeight: availH,
          gap: 10,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="text-white font-semibold text-sm">Crop Image</span>
          <button onClick={onCancel} className="text-white/50 hover:text-white text-lg leading-none">×</button>
        </div>

        {/* Aspect ratio tabs */}
        <div className="flex gap-2 flex-shrink-0">
          {RATIOS.map(({ label, value }) => (
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
        </div>

        {/* Crop area */}
        <div
          className="flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ height: cropAreaH, minHeight: 120 }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect ?? undefined}
            minWidth={20}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          >
            <img
              ref={imgRef}
              src={src}
              alt="crop-preview"
              onLoad={onImageLoad}
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: cropAreaH,
                objectFit: "contain",
                userSelect: "none",
              }}
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
