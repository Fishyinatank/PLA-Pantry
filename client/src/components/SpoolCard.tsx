import { AlertTriangle, Edit2, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FilamentRecord } from "@/lib/filamentStore";
import { LOW_STOCK_THRESHOLD } from "@/lib/filamentData";
import SpoolViz from "@/components/SpoolViz";

interface SpoolCardProps {
  filament: FilamentRecord;
  onEdit: (f: FilamentRecord) => void;
  onDelete: (id: number) => void;
  onRecalibrate: (f: FilamentRecord) => void;
  onOpenDetails?: (f: FilamentRecord) => void;
}

export default function SpoolCard({ filament, onEdit, onDelete, onRecalibrate, onOpenDetails }: SpoolCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const remaining = filament.remainingPercent !== null ? Number(filament.remainingPercent) : null;
  const remainingGrams = filament.remainingGrams !== null ? Number(filament.remainingGrams) : null;
  const isLowStock = remaining !== null && remaining <= LOW_STOCK_THRESHOLD;
  const hex = filament.colorHex || "#888888";

  const progressColor = isLowStock
    ? "oklch(0.65 0.20 25)"
    : remaining !== null && remaining <= 50
    ? "oklch(0.75 0.18 85)"
    : "oklch(0.65 0.18 145)";

  return (
    <div
      className="card-hover relative rounded-xl border overflow-hidden group"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
      onClick={() => onOpenDetails?.(filament)}
      role={onOpenDetails ? "button" : undefined}
      tabIndex={onOpenDetails ? 0 : undefined}
    >
      {/* Color band top */}
      <div className="h-1.5 w-full" style={{ background: hex }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <SpoolViz filament={filament} />

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">{filament.brand}</p>
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {filament.colorName || filament.materialFamily}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{ background: "oklch(0.78 0.16 85 / 0.12)", color: "var(--gold)" }}
                >
                  {filament.materialFamily}
                </span>
                {filament.materialSubtype && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
                  >
                    {filament.materialSubtype}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={(event) => { event.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={(event) => { event.stopPropagation(); setMenuOpen(false); }} />
                <div
                  className="absolute right-0 top-8 z-20 min-w-[120px] rounded-lg py-1 shadow-lg animate-scale-in"
                  style={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                >
                  <button
                    onClick={(event) => { event.stopPropagation(); setMenuOpen(false); onEdit(filament); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={(event) => { event.stopPropagation(); setMenuOpen(false); onDelete(filament.id); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Remaining info */}
        {remaining !== null ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isLowStock && <AlertTriangle className="w-3 h-3 text-destructive" />}
                <span className="text-xs text-muted-foreground">
                  {remainingGrams !== null ? `${remainingGrams}g remaining` : "Remaining"}
                </span>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: isLowStock ? "oklch(0.65 0.20 25)" : remaining <= 50 ? "var(--gold)" : "oklch(0.65 0.18 145)" }}
              >
                {Math.round(remaining)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, remaining)}%`, background: progressColor }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full skeleton" />
            <span className="text-xs text-muted-foreground">No weight data</span>
          </div>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border" style={{ background: hex, borderColor: `${hex}88` }} />
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">{filament.colorName || "—"}</span>
          </div>
          {filament.advertisedWeight && (
            <span className="text-xs text-muted-foreground">{Number(filament.advertisedWeight) >= 1000 ? `${Number(filament.advertisedWeight) / 1000}kg` : `${filament.advertisedWeight}g`}</span>
          )}
        </div>
        <button
          onClick={(event) => { event.stopPropagation(); onRecalibrate(filament); }}
          className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:bg-accent"
          style={{ border: "1px solid var(--border)", color: "var(--gold)" }}
        >
          Recalibrate
        </button>
      </div>
    </div>
  );
}
