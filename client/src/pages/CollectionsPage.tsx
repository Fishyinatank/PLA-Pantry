import SpoolCard from "@/components/SpoolCard";
import { getColorFamily } from "@/lib/filamentData";
import { useFilaments, type FilamentRecord } from "@/lib/filamentStore";
import { FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";

type GroupMode = "brand" | "material" | "storage" | "color";

const MODES: { key: GroupMode; label: string }[] = [
  { key: "brand", label: "Group by brand" },
  { key: "material", label: "Group by material family" },
  { key: "storage", label: "Group by storage location" },
  { key: "color", label: "Group by color family" },
];

function groupName(f: FilamentRecord, mode: GroupMode) {
  if (mode === "brand") return f.brand || "Unknown brand";
  if (mode === "material") return f.materialFamily || "Unknown material";
  if (mode === "storage") return f.storageLocation || "No location";
  return getColorFamily(f.colorHex || "#888888");
}

export default function CollectionsPage() {
  const { filaments, isLoading, deleteFilament, recalibrateFilament } = useFilaments();
  const [mode, setMode] = useState<GroupMode>("brand");

  const groups = useMemo(() => {
    const map = new Map<string, FilamentRecord[]>();
    filaments.forEach((f) => {
      const name = groupName(f, mode);
      map.set(name, [...(map.get(name) ?? []), f]);
    });
    return Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        items,
        totalGrams: items.reduce((sum, f) => sum + Number(f.remainingGrams ?? 0), 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filaments, mode]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Collections</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Smart groups from your logged spools</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODES.map((item) => (
              <button
                key={item.key}
                onClick={() => setMode(item.key)}
                className="rounded-lg px-3 py-2 text-xs font-semibold transition"
                style={{
                  background: mode === item.key ? "oklch(0.78 0.16 85 / 0.14)" : "var(--secondary)",
                  color: mode === item.key ? "var(--gold)" : "var(--secondary-foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 space-y-5">
        {isLoading ? (
          <div className="h-40 skeleton rounded-xl" />
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="font-semibold">No collections yet</h3>
            <p className="text-sm text-muted-foreground">Add spools first.</p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.name} className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-semibold">{group.name}</h2>
                  <p className="text-xs text-muted-foreground">{group.items.length} spool{group.items.length !== 1 ? "s" : ""} · {Math.round(group.totalGrams)}g remaining</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.items.map((f) => (
                  <SpoolCard
                    key={f.id}
                    filament={f}
                    onEdit={() => {}}
                    onDelete={(id) => deleteFilament(id)}
                    onRecalibrate={(spool) => {
                      const weight = window.prompt("Current roll weight including spool and filament (g)");
                      if (weight) recalibrateFilament(spool.id, Number(weight));
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
