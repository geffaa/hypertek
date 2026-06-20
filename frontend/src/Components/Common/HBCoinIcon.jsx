export default function HBCoinIcon({ size = 32, className = "" }) {
  return (
    <img
      src="/hyperbucks_2d.webp"
      alt="Hyper Bucks"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
