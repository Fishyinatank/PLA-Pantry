import { BRANDS, MATERIAL_FAMILIES, LOW_STOCK_THRESHOLD } from "@/lib/filamentData";
import { useFilaments, type FilamentRecord } from "@/lib/filamentStore";
import AddEditSpoolModal from "@/components/AddEditSpoolModal";
import SpoolCard from "@/components/SpoolCard";
import SpoolViz from "@/components/SpoolViz";
import {
  AlertTriangle,
  ChevronDown,
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  ExternalLink,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SortKey = "updatedAt" | "brand" | "material" | "remaining";
type ViewMode = "grid" | "list";

export default function FilamentsPage() {
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FilamentRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [recalibrateTarget, setRecalibrateTarget] = useState<FilamentRecord | null>(null);
  const [detailTarget, setDetailTarget] = useState<FilamentRecord | null>(null);
  const [recalibrateWeight, setRecalibrateWeight] = useState<number | "">("");
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    filaments,
    isLoading,
    error,
    createFilament,
    updateFilament,
    deleteFilament,
    recalibrateFilament,
  } = useFilaments();

  const filtered = useMemo(() => {
    let list = [...filaments];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(f =>
        f.brand.toLowerCase().includes(s) ||
        (f.colorName ?? "").toLowerCase().includes(s) ||
        f.materialFamily.toLowerCase().includes(s) ||
        (f.materialSubtype ?? "").toLowerCase().includes(s)
      );
    }
    if (filterBrand) list = list.filter(f => f.brand === filterBrand);
    if (filterMaterial) list = list.filter(f => f.materialFamily === filterMaterial);
    if (filterLowStock) list = list.filter(f => f.remainingPercent !== null && Number(f.remainingPercent) <= LOW_STOCK_THRESHOLD);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "brand") cmp = a.brand.localeCompare(b.brand);
      else if (sortKey === "material") cmp = a.materialFamily.localeCompare(b.materialFamily);
      else if (sortKey === "remaining") cmp = (Number(a.remainingPercent ?? 0)) - (Number(b.remainingPercent ?? 0));
      else cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [filaments, search, filterBrand, filterMaterial, filterLowStock, sortKey, sortAsc]);

  const hasFilters = filterBrand || filterMaterial || filterLowStock;
  const brandsInUse = useMemo(() => Array.from(new Set(filaments.map(f => f.brand))).sort(), [filaments]);
  const materialsInUse = useMemo(() => Array.from(new Set(filaments.map(f => f.materialFamily))).sort(), [filaments]);

  const handleEdit = (f: FilamentRecord) => { setEditTarget(f); setModalOpen(true); };
  const handleDelete = (id: number) => setDeleteId(id);
  const handleRecalibrate = (f: FilamentRecord) => {
    setRecalibrateTarget(f);
    setRecalibrateWeight(f.currentTotalWeight ? Number(f.currentTotalWeight) : "");
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFilament(deleteId);
      toast.success("Spool deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete spool");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Filaments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "Loading…" : `${filaments.length} spool${filaments.length !== 1 ? "s" : ""} in your inventory`}
            </p>
            {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
          </div>
          <button
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
          >
            <Plus className="w-4 h-4" />
            Add Spool
          </button>
        </div>

        {/* Search + controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brand, color, material…"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm transition-all"
              style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: hasFilters ? "oklch(0.78 0.16 85 / 0.12)" : "var(--secondary)",
              color: hasFilters ? "var(--gold)" : "var(--secondary-foreground)",
              border: hasFilters ? "1px solid oklch(0.78 0.16 85 / 0.30)" : "1px solid transparent",
            }}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />}
          </button>

          {/* Sort */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent"
              style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
              onClick={() => {
                const keys: SortKey[] = ["updatedAt", "brand", "material", "remaining"];
                const next = keys[(keys.indexOf(sortKey) + 1) % keys.length];
                setSortKey(next);
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {sortKey === "updatedAt" ? "Recent" : sortKey === "brand" ? "Brand" : sortKey === "material" ? "Material" : "Remaining"}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {(["grid", "list"] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="p-2 transition-all"
                style={{
                  background: viewMode === v ? "var(--accent)" : "var(--secondary)",
                  color: viewMode === v ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                {v === "grid" ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="mt-3 p-3 rounded-xl flex flex-wrap gap-4 animate-slide-up" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
            {/* Brand filter */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Brand</label>
              <select
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="w-full text-sm rounded-lg px-2.5 py-1.5"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="">All brands</option>
                {brandsInUse.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {/* Material filter */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Material</label>
              <select
                value={filterMaterial}
                onChange={e => setFilterMaterial(e.target.value)}
                className="w-full text-sm rounded-lg px-2.5 py-1.5"
                style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="">All materials</option>
                {materialsInUse.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {/* Low stock */}
            <div className="flex items-end pb-0.5">
              <button
                onClick={() => setFilterLowStock(!filterLowStock)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: filterLowStock ? "oklch(0.55 0.20 25 / 0.15)" : "var(--input)",
                  color: filterLowStock ? "oklch(0.65 0.20 25)" : "var(--secondary-foreground)",
                  border: filterLowStock ? "1px solid oklch(0.55 0.20 25 / 0.40)" : "1px solid var(--border)",
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock
              </button>
            </div>
            {/* Clear */}
            {hasFilters && (
              <div className="flex items-end pb-0.5">
                <button
                  onClick={() => { setFilterBrand(""); setFilterMaterial(""); setFilterLowStock(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="h-1.5 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full skeleton shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 skeleton rounded w-2/3" />
                      <div className="h-4 skeleton rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            {filaments.length === 0 ? (
              <>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.78 0.16 85 / 0.08)", border: "1px solid oklch(0.78 0.16 85 / 0.20)" }}>
                  <Plus className="w-8 h-8" style={{ color: "var(--gold)" }} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-1">No spools yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Add your first filament spool to start tracking your inventory.</p>
                </div>
                <button
                  onClick={() => { setEditTarget(null); setModalOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
                >
                  <Plus className="w-4 h-4" /> Add Your First Spool
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-semibold text-foreground mb-1">No results found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
                <button
                  onClick={() => { setSearch(""); setFilterBrand(""); setFilterMaterial(""); setFilterLowStock(false); }}
                  className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(f => (
              <SpoolCard key={f.id} filament={f} onEdit={handleEdit} onDelete={handleDelete} onRecalibrate={handleRecalibrate} onOpenDetails={setDetailTarget} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(f => (
              <div
                key={f.id}
                className="card-hover flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
                onClick={() => setDetailTarget(f)}
              >
                <div
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${f.colorHex}cc, ${f.colorHex}88)`,
                    border: `2px solid ${f.colorHex}66`,
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "var(--card)" }} />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{f.brand}</p>
                    <p className="text-sm font-medium text-foreground truncate">{f.colorName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="text-sm text-foreground">{f.materialFamily}{f.materialSubtype ? ` · ${f.materialSubtype}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-sm font-semibold" style={{ color: f.remainingPercent !== null && Number(f.remainingPercent) <= 20 ? "oklch(0.65 0.20 25)" : "var(--foreground)" }}>
                      {f.remainingGrams !== null ? `${Math.round(Number(f.remainingGrams))}g` : "—"}
                      {f.remainingPercent !== null && <span className="text-muted-foreground font-normal ml-1">({Math.round(Number(f.remainingPercent))}%)</span>}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    {f.remainingPercent !== null && (
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(2, Number(f.remainingPercent))}%`,
                            background: Number(f.remainingPercent) <= 20 ? "oklch(0.65 0.20 25)" : "oklch(0.65 0.18 145)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(event) => { event.stopPropagation(); handleEdit(f); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={(event) => { event.stopPropagation(); handleDelete(f.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <button onClick={(event) => { event.stopPropagation(); handleRecalibrate(f); }} className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-accent transition-all" style={{ color: "var(--gold)" }}>
                    Recalibrate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailTarget && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={() => setDetailTarget(null)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto shadow-2xl animate-slide-right" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full shrink-0" style={{ background: detailTarget.colorHex, border: `2px solid ${detailTarget.colorHex}88` }} />
                <div className="min-w-0">
                  <h2 className="font-semibold truncate">{detailTarget.brand}</h2>
                  <p className="text-xs text-muted-foreground truncate">{detailTarget.materialFamily}{detailTarget.materialSubtype ? ` · ${detailTarget.materialSubtype}` : ""}</p>
                </div>
              </div>
              <button onClick={() => setDetailTarget(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-5">
              <div className="rounded-2xl border p-5 text-center" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                <div className="flex justify-center">
                  <SpoolViz filament={detailTarget} size="lg" />
                </div>
                <p className="mt-3 text-lg font-semibold">{detailTarget.remainingGrams ? `${Math.round(Number(detailTarget.remainingGrams))}g` : "Not recorded"}</p>
                <p className="text-xs text-muted-foreground">{detailTarget.remainingPercent ? `${Math.round(Number(detailTarget.remainingPercent))}% remaining` : "Remaining percent not recorded"}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { setDetailTarget(null); handleEdit(detailTarget); }} className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>Edit</button>
                <button onClick={() => { setDetailTarget(null); handleRecalibrate(detailTarget); }} className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>Recalibrate</button>
                <button onClick={() => { setDetailTarget(null); handleDelete(detailTarget.id); }} className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "oklch(0.55 0.20 25 / 0.15)", color: "oklch(0.55 0.20 25)" }}>Delete</button>
              </div>

              <DetailSection title="Identity" rows={[
                ["Brand", detailTarget.brand],
                ["Product line", detailTarget.productLine],
                ["Material", `${detailTarget.materialFamily}${detailTarget.materialSubtype ? ` · ${detailTarget.materialSubtype}` : ""}`],
                ["Color", `${detailTarget.colorName ?? "Unnamed"} · ${detailTarget.colorHex}`],
              ]} />
              <DetailSection title="Weight" rows={[
                ["Advertised", detailTarget.advertisedWeight ? `${detailTarget.advertisedWeight}g` : null],
                ["Remaining", detailTarget.remainingGrams ? `${Math.round(Number(detailTarget.remainingGrams))}g` : null],
                ["Percent", detailTarget.remainingPercent ? `${Math.round(Number(detailTarget.remainingPercent))}%` : null],
                ["Spool", [detailTarget.spoolType, detailTarget.spoolMaterial].filter(Boolean).join(" · ")],
              ]} />
              <DetailSection title="Storage" rows={[
                ["Location", detailTarget.storageLocation],
                ["Dry box", detailTarget.isDryBox ? "Yes" : "No"],
                ["Purchase", detailTarget.purchaseLink],
                ["Notes", detailTarget.notes],
              ]} linkValue={detailTarget.purchaseLink ?? undefined} />
              <DetailSection title="Print Settings" rows={[
                ["Max flow", detailTarget.maxVolumetricFlow],
                ["Pressure advance", detailTarget.pressureAdvance],
                ["Nozzle", detailTarget.nozzleTempMin || detailTarget.nozzleTempMax ? `${detailTarget.nozzleTempMin ?? "?"}-${detailTarget.nozzleTempMax ?? "?"} C` : null],
                ["Bed", detailTarget.bedTemp ? `${detailTarget.bedTemp} C` : null],
                ["Chamber", detailTarget.chamberTemp ? `${detailTarget.chamberTemp} C` : null],
                ["Cooling", detailTarget.coolingFanPercent ? `${detailTarget.coolingFanPercent}%` : null],
                ["Speed", detailTarget.recommendedSpeed ? `${detailTarget.recommendedSpeed} mm/s` : null],
                ["Drying", detailTarget.dryingTemp || detailTarget.dryingTime ? `${detailTarget.dryingTemp ?? "?"} C · ${detailTarget.dryingTime ?? "?"}` : null],
                ["Slicer notes", detailTarget.slicerNotes],
              ]} />
              <DetailSection title="Dates" rows={[
                ["Created", detailTarget.createdAt ? detailTarget.createdAt.toLocaleDateString() : null],
                ["Updated", detailTarget.updatedAt ? detailTarget.updatedAt.toLocaleDateString() : null],
              ]} />
            </div>
          </aside>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditSpoolModal
        open={modalOpen}
        editTarget={editTarget}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSaved={() => { setModalOpen(false); setEditTarget(null); }}
        onCreate={createFilament}
        onUpdate={updateFilament}
      />

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 rounded-2xl p-6 max-w-sm w-full mx-4 animate-scale-in" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-base font-semibold text-foreground mb-2">Delete Spool?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone. The spool will be permanently removed from your inventory.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {recalibrateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setRecalibrateTarget(null)} />
          <div className="relative z-10 rounded-2xl p-6 max-w-sm w-full mx-4 animate-scale-in" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-base font-semibold text-foreground mb-2">Recalibrate Spool</h3>
            <p className="text-sm text-muted-foreground mb-4">Current roll weight including spool and filament.</p>
            <input
              type="number"
              value={recalibrateWeight}
              onChange={e => setRecalibrateWeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: "var(--input)", border: "1px solid var(--border)" }}
              placeholder="Current weight (g)"
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRecalibrateTarget(null)} className="flex-1 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">Cancel</button>
              <button
                onClick={async () => {
                  if (recalibrateWeight === "") return toast.error("Weight required");
                  try {
                    await recalibrateFilament(recalibrateTarget.id, Number(recalibrateWeight));
                    toast.success("Spool recalibrated");
                    setRecalibrateTarget(null);
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Failed to recalibrate");
                  }
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, rows, linkValue }: { title: string; rows: [string, unknown][]; linkValue?: string }) {
  return (
    <section className="rounded-xl border p-4" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            {linkValue && value === linkValue ? (
              <a href={linkValue} target="_blank" rel="noreferrer" className="min-w-0 truncate font-medium" style={{ color: "var(--gold)" }}>{String(value)} <ExternalLink className="inline w-3 h-3" /></a>
            ) : (
              <span className="min-w-0 break-words font-medium">{value ? String(value) : "Not recorded"}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
