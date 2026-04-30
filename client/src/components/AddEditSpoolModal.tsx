import {
  ADVERTISED_WEIGHTS,
  COLOR_PRESETS,
  SPOOL_MATERIALS,
  SPOOL_TYPES,
} from "@/lib/filamentData";
import { useAuth } from "@/_core/hooks/useAuth";
import type { FilamentInput, FilamentRecord } from "@/lib/filamentStore";
import { useReferenceData } from "@/lib/referenceDataStore";
import { Check, ChevronDown, Palette, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AddEditSpoolModalProps {
  open: boolean;
  editTarget?: FilamentRecord | null;
  onClose: () => void;
  onSaved: () => void;
  onCreate: (input: FilamentInput) => Promise<void>;
  onUpdate: (id: number, input: FilamentInput) => Promise<void>;
}

const FIELD_STYLE = {
  background: "var(--input)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--foreground)",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const LABEL_STYLE = "block text-xs font-medium text-muted-foreground mb-1.5";

type SidePanel = "brand" | "color" | "spoolType" | "spoolMaterial" | null;

export default function AddEditSpoolModal({
  open,
  editTarget,
  onClose,
  onSaved,
  onCreate,
  onUpdate,
}: AddEditSpoolModalProps) {
  const { session } = useAuth();
  const { data: referenceData, loading: referenceLoading, error: referenceError, reload: reloadReferenceData } = useReferenceData();
  // Form state
  const [brand, setBrand] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandDropOpen, setBrandDropOpen] = useState(false);
  const [productLine, setProductLine] = useState("");
  const [materialFamily, setMaterialFamily] = useState("PLA");
  const [materialSubtype, setMaterialSubtype] = useState("");
  const [colorHex, setColorHex] = useState("#888888");
  const [colorName, setColorName] = useState("");
  const [advertisedWeight, setAdvertisedWeight] = useState<number | "">(1000);
  const [spoolType, setSpoolType] = useState("Standard");
  const [spoolMaterial, setSpoolMaterial] = useState("Plastic");
  const [measurementMethod, setMeasurementMethod] = useState<"empty_spool" | "full_spool">("empty_spool");
  const [emptySpoolWeight, setEmptySpoolWeight] = useState<number | "">("");
  const [fullSpoolWeight, setFullSpoolWeight] = useState<number | "">("");
  const [currentTotalWeight, setCurrentTotalWeight] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [purchaseLink, setPurchaseLink] = useState("");
  const [supplier, setSupplier] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [isDryBox, setIsDryBox] = useState(false);
  const [spoolCondition, setSpoolCondition] = useState<"new" | "used" | null>(null);
  const [freshSpoolCount, setFreshSpoolCount] = useState<number | "">(1);
  const [maxVolumetricFlow, setMaxVolumetricFlow] = useState<number | "">("");
  const [pressureAdvance, setPressureAdvance] = useState<number | "">("");
  const [nozzleTempMin, setNozzleTempMin] = useState<number | "">("");
  const [nozzleTempMax, setNozzleTempMax] = useState<number | "">("");
  const [bedTemp, setBedTemp] = useState<number | "">("");
  const [chamberTemp, setChamberTemp] = useState<number | "">("");
  const [coolingFanPercent, setCoolingFanPercent] = useState<number | "">("");
  const [recommendedSpeed, setRecommendedSpeed] = useState<number | "">("");
  const [dryingTemp, setDryingTemp] = useState<number | "">("");
  const [dryingTime, setDryingTime] = useState("");
  const [slicerNotes, setSlicerNotes] = useState("");
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [hexInput, setHexInput] = useState("#888888");
  const [activeTab, setActiveTab] = useState<"basic" | "weight" | "details" | "print">("basic");

  const brandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) void reloadReferenceData(session?.access_token);
  }, [open, reloadReferenceData, session?.access_token]);

  // Populate form when editing
  useEffect(() => {
    if (editTarget) {
      setBrand(editTarget.brand);
      setBrandSearch(editTarget.brand);
      setProductLine(editTarget.productLine ?? "");
      setMaterialFamily(editTarget.materialFamily);
      setMaterialSubtype(editTarget.materialSubtype ?? "");
      setColorHex(editTarget.colorHex);
      setColorName(editTarget.colorName ?? "");
      setAdvertisedWeight(editTarget.advertisedWeight ? Number(editTarget.advertisedWeight) : "");
      setSpoolType(editTarget.spoolType ?? "Standard");
      setSpoolMaterial(editTarget.spoolMaterial ?? "Plastic");
      setMeasurementMethod(editTarget.measurementMethod ?? "empty_spool");
      setEmptySpoolWeight(editTarget.emptySpoolWeight ? Number(editTarget.emptySpoolWeight) : "");
      setFullSpoolWeight(editTarget.fullSpoolWeight ? Number(editTarget.fullSpoolWeight) : "");
      setCurrentTotalWeight(editTarget.currentTotalWeight ? Number(editTarget.currentTotalWeight) : "");
      setNotes(editTarget.notes ?? "");
      setPurchaseLink(editTarget.purchaseLink ?? "");
      setSupplier(editTarget.supplier ?? "");
      setStorageLocation(editTarget.storageLocation ?? "");
      setIsDryBox(editTarget.isDryBox ?? false);
      setSpoolCondition("used");
      setFreshSpoolCount(1);
      setMaxVolumetricFlow(editTarget.maxVolumetricFlow ? Number(editTarget.maxVolumetricFlow) : "");
      setPressureAdvance(editTarget.pressureAdvance ? Number(editTarget.pressureAdvance) : "");
      setNozzleTempMin(editTarget.nozzleTempMin ?? "");
      setNozzleTempMax(editTarget.nozzleTempMax ?? "");
      setBedTemp(editTarget.bedTemp ?? "");
      setChamberTemp(editTarget.chamberTemp ?? "");
      setCoolingFanPercent(editTarget.coolingFanPercent ?? "");
      setRecommendedSpeed(editTarget.recommendedSpeed ?? "");
      setDryingTemp(editTarget.dryingTemp ?? "");
      setDryingTime(editTarget.dryingTime ?? "");
      setSlicerNotes(editTarget.slicerNotes ?? "");
      setHexInput(editTarget.colorHex);
    } else {
      setBrand(""); setBrandSearch(""); setProductLine(""); setMaterialFamily("PLA"); setMaterialSubtype("");
      setColorHex("#888888"); setColorName(""); setAdvertisedWeight(1000); setSpoolType("Standard");
      setSpoolMaterial("Plastic"); setMeasurementMethod("empty_spool"); setEmptySpoolWeight("");
      setFullSpoolWeight(""); setCurrentTotalWeight(""); setNotes(""); setPurchaseLink("");
      setSupplier(""); setStorageLocation(""); setIsDryBox(false); setHexInput("#888888");
      setSpoolCondition(null); setFreshSpoolCount(1);
      setMaxVolumetricFlow(""); setPressureAdvance(""); setNozzleTempMin(""); setNozzleTempMax("");
      setBedTemp(""); setChamberTemp(""); setCoolingFanPercent(""); setRecommendedSpeed("");
      setDryingTemp(""); setDryingTime(""); setSlicerNotes("");
    }
    setActiveTab("basic");
    setSidePanel(null);
  }, [editTarget, open]);

  // Calculated preview
  const calcRemaining = () => {
    const adv = advertisedWeight !== "" ? Number(advertisedWeight) : null;
    const cur = currentTotalWeight !== "" ? Number(currentTotalWeight) : null;
    if (cur === null) return null;
    if (spoolCondition === "new" && adv) {
      return { grams: Math.round(adv), pct: 100 };
    }
    if (measurementMethod === "empty_spool" && emptySpoolWeight !== "") {
      const rem = Math.max(0, cur - Number(emptySpoolWeight));
      const pct = adv ? Math.min(100, Math.round((rem / adv) * 100)) : null;
      return { grams: Math.round(rem), pct };
    }
    if (measurementMethod === "full_spool" && fullSpoolWeight !== "" && adv) {
      const empty = Number(fullSpoolWeight) - adv;
      const rem = Math.max(0, cur - empty);
      const pct = Math.min(100, Math.round((rem / adv) * 100));
      return { grams: Math.round(rem), pct };
    }
    return null;
  };
  const preview = calcRemaining();

  const filteredBrands = referenceData.brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  const subtypes = referenceData.materialSubtypes[materialFamily] ?? ["Standard"];

  const handleSave = async () => {
    if (!brand.trim()) { toast.error("Brand is required"); return; }
    const adv = advertisedWeight !== "" ? Number(advertisedWeight) : undefined;
    const cur = currentTotalWeight !== "" ? Number(currentTotalWeight) : undefined;
    if (spoolCondition === "new" && (!adv || cur === undefined)) {
      toast.error("Advertised weight and total weight are required.");
      return;
    }
    const isNewSpool = spoolCondition === "new" && !editTarget;
    const calculatedEmptyWeight = isNewSpool && adv !== undefined && cur !== undefined ? Math.max(0, cur - adv) : undefined;
    const payload: FilamentInput = {
      brand: brand.trim(),
      productLine: productLine || undefined,
      materialFamily,
      materialSubtype: materialSubtype || undefined,
      colorHex,
      colorName: colorName || undefined,
      advertisedWeight: adv,
      spoolType: spoolType || undefined,
      spoolMaterial: spoolMaterial || undefined,
      measurementMethod: isNewSpool ? "empty_spool" : measurementMethod,
      emptySpoolWeight: isNewSpool ? calculatedEmptyWeight : emptySpoolWeight !== "" ? Number(emptySpoolWeight) : undefined,
      fullSpoolWeight: isNewSpool ? undefined : fullSpoolWeight !== "" ? Number(fullSpoolWeight) : undefined,
      currentTotalWeight: cur,
      notes: notes || undefined,
      purchaseLink: purchaseLink || undefined,
      supplier: supplier || undefined,
      storageLocation: storageLocation || undefined,
      isDryBox,
      maxVolumetricFlow: maxVolumetricFlow !== "" ? Number(maxVolumetricFlow) : undefined,
      pressureAdvance: pressureAdvance !== "" ? Number(pressureAdvance) : undefined,
      nozzleTempMin: nozzleTempMin !== "" ? Number(nozzleTempMin) : undefined,
      nozzleTempMax: nozzleTempMax !== "" ? Number(nozzleTempMax) : undefined,
      bedTemp: bedTemp !== "" ? Number(bedTemp) : undefined,
      chamberTemp: chamberTemp !== "" ? Number(chamberTemp) : undefined,
      coolingFanPercent: coolingFanPercent !== "" ? Number(coolingFanPercent) : undefined,
      recommendedSpeed: recommendedSpeed !== "" ? Number(recommendedSpeed) : undefined,
      dryingTemp: dryingTemp !== "" ? Number(dryingTemp) : undefined,
      dryingTime: dryingTime || undefined,
      slicerNotes: slicerNotes || undefined,
    };
    try {
      setSaving(true);
      if (editTarget) {
        await onUpdate(editTarget.id, payload);
        toast.success("Spool updated!");
      } else {
        const count = spoolCondition === "new" ? Number(freshSpoolCount || 1) : 1;
        for (let i = 0; i < Math.max(1, count); i++) {
          await onCreate(payload);
        }
        toast.success("Spool saved!");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save spool");
    } finally {
      setSaving(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const isLoading = saving;

  if (!open) return null;

  if (!editTarget && !spoolCondition) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-scale-in" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Add Spool</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid gap-3">
            <button onClick={() => setSpoolCondition("new")} className="rounded-xl p-4 text-left transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <p className="font-semibold text-foreground">New spool</p>
              <p className="text-xs text-muted-foreground mt-1">Fresh sealed or unused spool.</p>
            </button>
            <button onClick={() => setSpoolCondition("used")} className="rounded-xl p-4 text-left transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <p className="font-semibold text-foreground">Used spool</p>
              <p className="text-xs text-muted-foreground mt-1">Existing spool with current weight.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 animate-scale-in max-h-[90vh] w-full max-w-lg mx-4">
        {/* Main Modal */}
        <div
          className="w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              {/* Spool preview */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${colorHex}cc, ${colorHex}88)`,
                  boxShadow: `0 0 8px ${colorHex}44`,
                  border: `2px solid ${colorHex}66`,
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: "var(--card)", border: "1.5px solid oklch(0.30 0.008 240)" }} />
              </div>
              <h2 className="text-base font-semibold text-foreground">{editTarget ? "Edit Spool" : "Add Spool"}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
            {(["basic", "weight", "details", "print"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSidePanel(null); setBrandDropOpen(false); }}
                className="flex-1 py-2.5 text-xs font-medium capitalize transition-colors"
                style={{
                  color: activeTab === tab ? "var(--gold)" : "var(--muted-foreground)",
                  borderBottom: activeTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {tab === "basic" ? "Identity" : tab === "weight" ? "Weight" : tab === "details" ? "Details" : "Print Settings"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[430px] transition-all duration-200">
            {activeTab === "basic" && (
              <>
                {/* Brand */}
                <div className="relative">
                  <label className={LABEL_STYLE}>Brand *</label>
                  <div className="relative">
                    <input
                      ref={brandInputRef}
                      value={brandSearch}
                      onChange={e => { setBrandSearch(e.target.value); setBrand(e.target.value); setBrandDropOpen(true); setSidePanel("brand"); }}
                      onFocus={() => { setBrandDropOpen(true); setSidePanel("brand"); }}
                      placeholder="Search or type brand…"
                      style={FIELD_STYLE}
                    />
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Product Line */}
                <div>
                  <label className={LABEL_STYLE}>Product Line</label>
                  <input value={productLine} onChange={e => setProductLine(e.target.value)} placeholder="e.g. PolyLite, Basic, Pro…" style={FIELD_STYLE} />
                </div>

                {/* Material Family */}
                <div>
                  <label className={LABEL_STYLE}>Material Family *</label>
                  {referenceLoading && <p className="mb-2 text-xs text-muted-foreground">Loading material families…</p>}
                  {referenceError && <p className="mb-2 text-xs" style={{ color: "var(--auth-warning-text)" }}>Using fallback material families.</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {referenceData.materialFamilies.map(m => (
                      <button
                        key={m}
                        onClick={() => { setMaterialFamily(m); setMaterialSubtype(""); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: materialFamily === m ? "oklch(0.78 0.16 85 / 0.15)" : "var(--secondary)",
                          color: materialFamily === m ? "var(--gold)" : "var(--secondary-foreground)",
                          border: materialFamily === m ? "1px solid oklch(0.78 0.16 85 / 0.40)" : "1px solid transparent",
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <input
                    value={materialFamily}
                    onChange={e => { setMaterialFamily(e.target.value); setMaterialSubtype(""); }}
                    placeholder="Custom material family"
                    className="mt-2"
                    style={FIELD_STYLE}
                  />
                </div>

                {/* Subtype */}
                <div>
                  <label className={LABEL_STYLE}>Subtype</label>
                  <div className="flex flex-wrap gap-1.5">
                    {subtypes.map(s => (
                      <button
                        key={s}
                        onClick={() => setMaterialSubtype(materialSubtype === s ? "" : s)}
                        className="px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{
                          background: materialSubtype === s ? "oklch(0.65 0.18 200 / 0.15)" : "var(--secondary)",
                          color: materialSubtype === s ? "oklch(0.65 0.18 200)" : "var(--secondary-foreground)",
                          border: materialSubtype === s ? "1px solid oklch(0.65 0.18 200 / 0.40)" : "1px solid transparent",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    value={materialSubtype}
                    onChange={e => setMaterialSubtype(e.target.value)}
                    placeholder="Custom subtype"
                    className="mt-2"
                    style={FIELD_STYLE}
                  />
                </div>

                {/* Color */}
                <div>
                  <label className={LABEL_STYLE}>Color</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSidePanel(sidePanel === "color" ? null : "color")}
                      className="flex items-center gap-2.5 flex-1 px-3 py-2 rounded-lg text-sm transition-all hover:border-primary"
                      style={{ background: "var(--input)", border: "1px solid var(--border)" }}
                    >
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: colorHex, border: "1.5px solid oklch(0.35 0.008 240)" }} />
                      <span className="text-muted-foreground">{colorName || colorHex}</span>
                      <Palette className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                    </button>
                    <input
                      value={colorName}
                      onChange={e => setColorName(e.target.value)}
                      placeholder="Color name"
                      style={{ ...FIELD_STYLE, width: "120px" }}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "weight" && (
              <>
                {/* Advertised weight */}
                {spoolCondition === "new" && (
                  <div>
                    <label className={LABEL_STYLE}>Number of fresh spools</label>
                    <input type="number" min={1} value={freshSpoolCount} onChange={e => setFreshSpoolCount(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} />
                  </div>
                )}
                <div>
                  <label className={LABEL_STYLE}>Advertised Spool Weight</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ADVERTISED_WEIGHTS.map(w => (
                      <button
                        key={w.value}
                        onClick={() => setAdvertisedWeight(w.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: advertisedWeight === w.value ? "oklch(0.78 0.16 85 / 0.15)" : "var(--secondary)",
                          color: advertisedWeight === w.value ? "var(--gold)" : "var(--secondary-foreground)",
                          border: advertisedWeight === w.value ? "1px solid oklch(0.78 0.16 85 / 0.40)" : "1px solid transparent",
                        }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={advertisedWeight}
                    onChange={e => setAdvertisedWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Custom weight (g)"
                    style={FIELD_STYLE}
                  />
                </div>

                {/* Spool type & material */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_STYLE}>Spool Type</label>
                    <button type="button" onClick={() => { setBrandDropOpen(false); setSidePanel(sidePanel === "spoolType" ? null : "spoolType"); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm" style={FIELD_STYLE}>
                      <span>{spoolType}</span><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <label className={LABEL_STYLE}>Spool Material</label>
                    <button type="button" onClick={() => { setBrandDropOpen(false); setSidePanel(sidePanel === "spoolMaterial" ? null : "spoolMaterial"); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm" style={FIELD_STYLE}>
                      <span>{spoolMaterial}</span><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Measurement method */}
                {spoolCondition !== "new" && <div>
                  <label className={LABEL_STYLE}>Measurement Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "empty_spool", label: "Empty Spool Weight Known" },
                      { value: "full_spool", label: "Full Spool Weight Known" },
                    ] as const).map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMeasurementMethod(m.value)}
                        className="px-3 py-2.5 rounded-lg text-xs font-medium text-center transition-all"
                        style={{
                          background: measurementMethod === m.value ? "oklch(0.78 0.16 85 / 0.12)" : "var(--secondary)",
                          color: measurementMethod === m.value ? "var(--gold)" : "var(--secondary-foreground)",
                          border: measurementMethod === m.value ? "1px solid oklch(0.78 0.16 85 / 0.35)" : "1px solid transparent",
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>}

                {/* Dynamic weight fields */}
                {spoolCondition !== "new" && (measurementMethod === "empty_spool" ? (
                  <div>
                    <label className={LABEL_STYLE}>Empty Spool Weight (g)</label>
                    <input
                      type="number"
                      value={emptySpoolWeight}
                      onChange={e => setEmptySpoolWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 250"
                      style={FIELD_STYLE}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={LABEL_STYLE}>Full Spool Weight (g)</label>
                    <input
                      type="number"
                      value={fullSpoolWeight}
                      onChange={e => setFullSpoolWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 1250"
                      style={FIELD_STYLE}
                    />
                  </div>
                ))}

                {/* Current total weight */}
                <div>
                  <label className={LABEL_STYLE}>{spoolCondition === "new" ? "Total weight including spool and filament (g)" : "Current Total Weight (g) — weigh the spool now"}</label>
                  <input
                    type="number"
                    value={currentTotalWeight}
                    onChange={e => setCurrentTotalWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 850"
                    style={FIELD_STYLE}
                  />
                </div>

                {/* Calculated preview */}
                {preview && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-4 animate-slide-up"
                    style={{ background: "oklch(0.78 0.16 85 / 0.08)", border: "1px solid oklch(0.78 0.16 85 / 0.20)" }}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold" style={{ color: "var(--gold)" }}>{preview.grams}g</p>
                      <p className="text-xs text-muted-foreground">remaining</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Remaining</span>
                        <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>{preview.pct ?? "?"}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${preview.pct ?? 0}%`, background: "var(--gold)" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "details" && (
              <>
                <div>
                  <label className={LABEL_STYLE}>Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this spool…" rows={3} style={{ ...FIELD_STYLE, resize: "vertical" }} />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Purchase Link</label>
                  <input value={purchaseLink} onChange={e => setPurchaseLink(e.target.value)} placeholder="https://…" style={FIELD_STYLE} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_STYLE}>Supplier</label>
                    <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Amazon, Bambu…" style={FIELD_STYLE} />
                  </div>
                  <div>
                    <label className={LABEL_STYLE}>Storage Location</label>
                    <input value={storageLocation} onChange={e => setStorageLocation(e.target.value)} placeholder="Shelf A, Dry box…" style={FIELD_STYLE} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsDryBox(!isDryBox)}
                    className="w-10 h-5 rounded-full transition-all relative"
                    style={{ background: isDryBox ? "var(--gold)" : "var(--secondary)" }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ background: "white", left: isDryBox ? "calc(100% - 1.125rem)" : "0.125rem" }}
                    />
                  </button>
                  <label className="text-sm text-foreground cursor-pointer" onClick={() => setIsDryBox(!isDryBox)}>Stored in dry box</label>
                </div>
              </>
            )}

            {activeTab === "print" && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL_STYLE}>Max volumetric flow</label><input type="number" value={maxVolumetricFlow} onChange={e => setMaxVolumetricFlow(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Pressure advance</label><input type="number" value={pressureAdvance} onChange={e => setPressureAdvance(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Nozzle min</label><input type="number" value={nozzleTempMin} onChange={e => setNozzleTempMin(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Nozzle max</label><input type="number" value={nozzleTempMax} onChange={e => setNozzleTempMax(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Bed temp</label><input type="number" value={bedTemp} onChange={e => setBedTemp(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Chamber temp</label><input type="number" value={chamberTemp} onChange={e => setChamberTemp(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Cooling fan %</label><input type="number" value={coolingFanPercent} onChange={e => setCoolingFanPercent(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Recommended speed</label><input type="number" value={recommendedSpeed} onChange={e => setRecommendedSpeed(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Drying temp</label><input type="number" value={dryingTemp} onChange={e => setDryingTemp(e.target.value === "" ? "" : Number(e.target.value))} style={FIELD_STYLE} /></div>
                  <div><label className={LABEL_STYLE}>Drying time</label><input value={dryingTime} onChange={e => setDryingTime(e.target.value)} placeholder="e.g. 6h" style={FIELD_STYLE} /></div>
                </div>
                <div>
                  <label className={LABEL_STYLE}>Slicer profile notes</label>
                  <textarea value={slicerNotes} onChange={e => setSlicerNotes(e.target.value)} rows={3} style={{ ...FIELD_STYLE, resize: "vertical" }} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !brand.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
            >
              {isLoading ? "Saving…" : editTarget ? "Save Changes" : "Add Spool"}
            </button>
          </div>
        </div>

        {/* Side panels */}
        {sidePanel === "brand" && brandDropOpen && (
          <div
            className="fixed bottom-4 left-4 right-4 z-30 max-h-[45vh] overflow-hidden rounded-2xl shadow-2xl animate-slide-up lg:absolute lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[560px] lg:w-72 lg:max-h-[90vh] lg:-translate-y-1/2 lg:translate-x-[17.5rem] lg:animate-slide-right"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-sm font-semibold text-foreground">Choose Brand</span>
              <button onClick={() => { setBrandDropOpen(false); setSidePanel(null); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-full overflow-y-auto p-2">
              {referenceLoading && <p className="px-3 py-2 text-sm text-muted-foreground">Loading brands…</p>}
              {referenceError && <p className="px-3 py-2 text-sm" style={{ color: "var(--auth-warning-text)" }}>Using fallback brands.</p>}
              {filteredBrands.map(b => (
                <button
                  key={b}
                  className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                  onClick={() => { setBrand(b); setBrandSearch(b); setBrandDropOpen(false); setSidePanel(null); }}
                >
                  {b}
                  {brand === b && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
              {!referenceLoading && filteredBrands.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">No matching brands. Keep typing to use a custom brand.</p>
              )}
            </div>
          </div>
        )}

        {sidePanel === "spoolType" && (
          <div className="fixed bottom-4 left-4 right-4 z-30 max-h-[45vh] overflow-hidden rounded-2xl shadow-2xl animate-slide-up lg:absolute lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[560px] lg:w-72 lg:max-h-[90vh] lg:-translate-y-1/2 lg:translate-x-[17.5rem] lg:animate-slide-right" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}><span className="text-sm font-semibold">Spool Type</span><button onClick={() => setSidePanel(null)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-3.5 h-3.5" /></button></div>
            <div className="overflow-y-auto p-2">{SPOOL_TYPES.map(t => <button key={t} onClick={() => { setSpoolType(t); setSidePanel(null); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent">{t}{spoolType === t && <Check className="w-3.5 h-3.5 text-primary" />}</button>)}</div>
          </div>
        )}

        {sidePanel === "spoolMaterial" && (
          <div className="fixed bottom-4 left-4 right-4 z-30 max-h-[45vh] overflow-hidden rounded-2xl shadow-2xl animate-slide-up lg:absolute lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[560px] lg:w-72 lg:max-h-[90vh] lg:-translate-y-1/2 lg:translate-x-[17.5rem] lg:animate-slide-right" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}><span className="text-sm font-semibold">Spool Material</span><button onClick={() => setSidePanel(null)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-3.5 h-3.5" /></button></div>
            <div className="overflow-y-auto p-2">{SPOOL_MATERIALS.map(m => <button key={m} onClick={() => { setSpoolMaterial(m); setSidePanel(null); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent">{m}{spoolMaterial === m && <Check className="w-3.5 h-3.5 text-primary" />}</button>)}</div>
          </div>
        )}

        {sidePanel === "color" && (
          <div
            className="fixed bottom-4 left-4 right-4 z-30 max-h-[45vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up lg:absolute lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[560px] lg:w-72 lg:max-h-[90vh] lg:-translate-y-1/2 lg:translate-x-[17.5rem] lg:animate-slide-right"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-sm font-semibold text-foreground">Pick Color</span>
              <button onClick={() => setSidePanel(null)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Presets */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Presets</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c.hex}
                      title={c.name}
                      onClick={() => {
                        setColorHex(c.hex);
                        setHexInput(c.hex);
                        if (!colorName) setColorName(c.name);
                        setSidePanel(null);
                      }}
                      className="w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-95"
                      style={{
                        background: c.hex,
                        border: colorHex === c.hex ? "2px solid white" : "1.5px solid oklch(0.30 0.008 240)",
                        boxShadow: colorHex === c.hex ? `0 0 6px ${c.hex}88` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Manual picker */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Custom</p>
                <input
                  type="color"
                  value={colorHex}
                  onChange={e => { setColorHex(e.target.value); setHexInput(e.target.value); }}
                  className="w-full h-10 rounded-lg cursor-pointer"
                  style={{ background: "var(--input)", border: "1px solid var(--border)", padding: "2px" }}
                />
              </div>

              {/* Hex input */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">Hex</p>
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full shrink-0" style={{ background: colorHex, border: "1.5px solid oklch(0.35 0.008 240)" }} />
                  <input
                    value={hexInput}
                    onChange={e => {
                      setHexInput(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setColorHex(e.target.value);
                    }}
                    placeholder="#000000"
                    style={{ ...FIELD_STYLE, fontFamily: "monospace" }}
                  />
                </div>
              </div>

              {/* Apply */}
              <button
                onClick={() => setSidePanel(null)}
                className="w-full py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
              >
                Apply Color
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
