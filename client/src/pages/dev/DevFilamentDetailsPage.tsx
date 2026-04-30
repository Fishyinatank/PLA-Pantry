import { useAuth } from "@/_core/hooks/useAuth";
import {
  createBrand,
  createFamily,
  createSubtype,
  deleteBrand,
  deleteFamily,
  deleteSubtype,
  loadDevReferenceRows,
  updateBrand,
  updateFamily,
  updateSubtype,
  type DevBrandRow,
  type DevFamilyRow,
  type DevSubtypeRow,
} from "@/lib/devReferenceStore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-4 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>
      <button onClick={onDelete} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

export default function DevFilamentDetailsPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? "";
  const [brands, setBrands] = useState<DevBrandRow[]>([]);
  const [families, setFamilies] = useState<DevFamilyRow[]>([]);
  const [subtypes, setSubtypes] = useState<DevSubtypeRow[]>([]);
  const [brandName, setBrandName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [subtypeName, setSubtypeName] = useState("");
  const [subtypeFamilyId, setSubtypeFamilyId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await loadDevReferenceRows(token);
      setBrands(rows.brands);
      setFamilies(rows.families);
      setSubtypes(rows.subtypes);
      if (!subtypeFamilyId && rows.families[0]) setSubtypeFamilyId(rows.families[0].id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load reference data");
    } finally {
      setLoading(false);
    }
  }, [subtypeFamilyId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedSubtypes = useMemo(() => {
    const groups = new Map<number, DevSubtypeRow[]>();
    for (const subtype of subtypes) groups.set(subtype.family_id, [...(groups.get(subtype.family_id) ?? []), subtype]);
    return groups;
  }, [subtypes]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await load();
      toast.success("Saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading reference data…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Filament Details</h1>
        <p className="text-sm text-muted-foreground">Manage live brand, material family, and subtype dropdown data.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={`Brands (${brands.length})`}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!brandName.trim()) return;
              void run(async () => {
                await createBrand(token, brandName);
                setBrandName("");
              });
            }}
            className="mb-4 flex gap-2"
          >
            <input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Add brand" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
            <button className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}><Plus className="h-4 w-4" /></button>
          </form>
          <div className="max-h-[520px] overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between border-t py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                <span>{brand.name}</span>
                <RowActions
                  onEdit={() => {
                    const next = window.prompt("Brand name", brand.name);
                    if (next?.trim()) void run(() => updateBrand(token, brand.id, next));
                  }}
                  onDelete={() => window.confirm(`Delete ${brand.name}?`) && void run(() => deleteBrand(token, brand.id))}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={`Material Families (${families.length})`}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!familyName.trim()) return;
              void run(async () => {
                await createFamily(token, familyName);
                setFamilyName("");
              });
            }}
            className="mb-4 flex gap-2"
          >
            <input value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder="Add family" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
            <button className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}><Plus className="h-4 w-4" /></button>
          </form>
          <div className="max-h-[520px] overflow-y-auto">
            {families.map((family) => (
              <div key={family.id} className="flex items-center justify-between border-t py-2 text-sm" style={{ borderColor: "var(--border)" }}>
                <span>{family.name}</span>
                <RowActions
                  onEdit={() => {
                    const next = window.prompt("Family name", family.name);
                    if (next?.trim()) void run(() => updateFamily(token, family.id, next));
                  }}
                  onDelete={() => window.confirm(`Delete ${family.name} and its subtypes?`) && void run(() => deleteFamily(token, family.id))}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title={`Material Subtypes (${subtypes.length})`}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!subtypeName.trim() || !subtypeFamilyId) return;
            void run(async () => {
              await createSubtype(token, Number(subtypeFamilyId), subtypeName);
              setSubtypeName("");
            });
          }}
          className="mb-4 grid gap-2 sm:grid-cols-[220px_1fr_auto]"
        >
          <select value={subtypeFamilyId} onChange={(event) => setSubtypeFamilyId(Number(event.target.value))} className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }}>
            {families.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}
          </select>
          <input value={subtypeName} onChange={(event) => setSubtypeName(event.target.value)} placeholder="Add subtype" className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
          <button className="rounded-lg px-3 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>Add</button>
        </form>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {families.map((family) => (
            <div key={family.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
              <h3 className="mb-2 text-sm font-semibold">{family.name}</h3>
              <div className="space-y-1">
                {(groupedSubtypes.get(family.id) ?? []).map((subtype) => (
                  <div key={subtype.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-accent">
                    <span>{subtype.name}</span>
                    <RowActions
                      onEdit={() => {
                        const next = window.prompt("Subtype name", subtype.name);
                        if (next?.trim()) void run(() => updateSubtype(token, subtype.id, next));
                      }}
                      onDelete={() => window.confirm(`Delete ${subtype.name}?`) && void run(() => deleteSubtype(token, subtype.id))}
                    />
                  </div>
                ))}
                {(groupedSubtypes.get(family.id) ?? []).length === 0 && <p className="text-xs text-muted-foreground">No subtypes.</p>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
