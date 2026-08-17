export function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(seed: string): string {
  const words = seed.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return seed.trim().slice(0, 2).toUpperCase() || "?";
}

export function Artwork({
  seed,
  size = 40,
  alt,
  className = "",
}: {
  seed: string;
  size?: number;
  alt?: string;
  className?: string;
}) {
  const h = hashSeed(seed);
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 7) * 20) % 360;
  const initials = getInitials(seed);

  return (
    <div
      role="img"
      aria-label={alt ?? seed}
      className={`flex items-center justify-center rounded-md select-none shrink-0 text-white/85 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue1} 45% 38%), hsl(${hue2} 50% 22%))`,
      }}
    >
      <span
        className="font-semibold leading-none"
        style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}
      >
        {initials}
      </span>
    </div>
  );
}
