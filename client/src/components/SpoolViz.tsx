import { useTheme } from "@/contexts/ThemeContext";
import type { FilamentRecord } from "@/lib/filamentStore";
import { useEffect, useState, type CSSProperties } from "react";

type SpoolVizProps = {
  filament: FilamentRecord;
  size?: "sm" | "lg";
};

const SPOOL_ASSET_VERSION = "20260424-2204";

function numeric(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function clampPercent(value: number | null) {
  if (value === null) return 0;
  return Math.max(0, Math.min(100, value));
}

function spoolPercent(filament: FilamentRecord) {
  const recordedPercent = numeric(filament.remainingPercent);
  if (recordedPercent !== null) return clampPercent(recordedPercent);

  const remaining = numeric(filament.remainingGrams);
  const advertised = numeric(filament.advertisedWeight);
  if (remaining !== null && advertised !== null && advertised > 0) {
    return clampPercent((remaining / advertised) * 100);
  }

  return 0;
}

function CssFallback({ color, percent, size }: { color: string; percent: number; size: "sm" | "lg" }) {
  const dimension = size === "lg" ? 232 : 108;
  const ringWidth = Math.round((size === "lg" ? 18 : 8) + (percent / 100) * (size === "lg" ? 58 : 28));

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: dimension,
        height: dimension,
        background: "linear-gradient(135deg, oklch(0.78 0.01 240), oklch(0.18 0.01 240))",
        boxShadow: "0 10px 22px oklch(0 0 0 / 0.22)",
      }}
    >
      {percent > 0 && (
        <div
          className="absolute rounded-full"
          style={{
            inset: "20%",
            border: `${ringWidth}px solid ${color}`,
            opacity: 0.85,
            boxShadow: "inset 0 0 18px oklch(0 0 0 / 0.28), 0 0 16px oklch(0 0 0 / 0.16)",
          }}
        />
      )}
      <div className="absolute inset-[9%] rounded-full border-[6px]" style={{ borderColor: "oklch(0.08 0.006 240 / 0.65)" }} />
      <div className="absolute inset-[38%] rounded-full" style={{ background: "var(--background)", border: "4px solid oklch(0.42 0.01 240)" }} />
    </div>
  );
}

export default function SpoolViz({ filament, size = "sm" }: SpoolVizProps) {
  const { theme } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const percent = spoolPercent(filament);
  const color = filament.colorHex || "#888888";
  const imagePath = theme === "dark" ? "/2D-Spool-Dark.png" : "/2D-Spool_Light.png";
  const imageSrc = `${imagePath}?v=${SPOOL_ASSET_VERSION}`;
  const dimension = size === "lg" ? 232 : 108;
  const innerRadius = 178;
  const maxOuterRadius = 452;
  const visualFill = percent <= 0 ? 0 : Math.sqrt(percent / 100);
  const outerRadius = innerRadius + (maxOuterRadius - innerRadius) * visualFill;
  const ringStroke = Math.max(0, outerRadius - innerRadius);
  const ringRadius = innerRadius + ringStroke / 2;
  const showFill = percent > 0.5;
  const spoolStyle = {
    "--spool-percent": percent,
    "--filament-color": color,
    "--spool-inner-radius": innerRadius,
    "--spool-outer-radius": outerRadius,
    width: dimension,
    height: dimension,
    filter: "drop-shadow(0 8px 16px oklch(0 0 0 / 0.20))",
  } as CSSProperties;

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  if (imageFailed) {
    return <CssFallback color={color} percent={percent} size={size} />;
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      role="img"
      aria-label={`${Math.round(percent)}% filament remaining`}
      style={spoolStyle}
    >
      {showFill && (
        <svg
          className="absolute inset-0 z-0 h-full w-full pointer-events-none"
          viewBox="0 0 1024 1024"
          aria-hidden="true"
        >
          <circle
            cx="512"
            cy="512"
            r={ringRadius}
            fill="none"
            stroke="var(--filament-color)"
            strokeWidth={ringStroke}
          />
        </svg>
      )}

      <img
        src={imageSrc}
        alt=""
        draggable={false}
        onError={() => setImageFailed(true)}
        className="absolute inset-0 z-20 h-full w-full select-none object-contain"
      />
    </div>
  );
}
