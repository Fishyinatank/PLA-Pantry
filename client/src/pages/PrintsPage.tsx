import { useFilaments } from "@/lib/filamentStore";
import { usePrintStore } from "@/lib/printStore";
import { Check, ChevronDown, Plus, Printer, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

type Flow = "choose" | "new" | "reprint" | null;
type PrintSidePanel = "spool" | "template" | null;
type ConfirmAction = { type: "single"; id: number } | { type: "clear" } | null;

const FIELD_STYLE = {
  background: "var(--input)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--foreground)",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
};

function spoolLabel(f: ReturnType<typeof useFilaments>["filaments"][number]) {
  return `${f.brand} ${f.materialFamily}${f.materialSubtype ? ` ${f.materialSubtype}` : ""} ${f.colorName ?? ""} — ${f.remainingGrams ?? "?"}g left`.replace(/\s+/g, " ").trim();
}

function formatPrintDate(value: unknown) {
  if (!value) return "Date unknown";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Date unknown" : date.toLocaleDateString();
}

function formatGrams(value: unknown) {
  const numberValue = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
  return value === null || value === undefined || Number.isNaN(numberValue) ? "Not recorded" : `${Math.round(numberValue)}g`;
}

export default function PrintsPage() {
  const { filaments, recalibrateFilament } = useFilaments();
  const { logs, templates, addLog, addTemplate, deleteLog, clearLogs, isLoading } = usePrintStore();
  const [flow, setFlow] = useState<Flow>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filamentId, setFilamentId] = useState("");
  const [gramsUsedInput, setGramsUsedInput] = useState<number | "">("");
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [sidePanel, setSidePanel] = useState<PrintSidePanel>(null);
  const [spoolSearch, setSpoolSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isSavingPrint, setIsSavingPrint] = useState(false);
  const [saveError, setSaveError] = useState("");

  const selectedTemplate = templates.find((t) => String(t.id) === templateId);
  const selectedSpool = filaments.find((f) => String(f.id) === filamentId);
  const filteredSpools = useMemo(() => {
    const needle = spoolSearch.trim().toLowerCase();
    if (!needle) return filaments;
    return filaments.filter((f) => spoolLabel(f).toLowerCase().includes(needle));
  }, [filaments, spoolSearch]);
  const filteredTemplates = useMemo(() => {
    const needle = templateSearch.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((t) => `${t.name} ${t.description ?? ""}`.toLowerCase().includes(needle));
  }, [templates, templateSearch]);

  const resetFlow = () => {
    setFlow(null);
    setSidePanel(null);
    setName("");
    setDescription("");
    setFilamentId("");
    setGramsUsedInput("");
    setSaveTemplate(false);
    setTemplateId("");
    setSpoolSearch("");
    setTemplateSearch("");
    setSaveError("");
    setIsSavingPrint(false);
  };

  const returnFilament = async (log: (typeof logs)[number]) => {
    if (!log.filamentId || !log.gramsUsed) return;
    const spool = filaments.find((f) => f.id === log.filamentId);
    if (!spool) return;
    const current = spool.currentTotalWeight
      ? Number(spool.currentTotalWeight)
      : Number(spool.remainingGrams ?? 0) + Number(spool.emptySpoolWeight ?? 0);
    await recalibrateFilament(spool.id, current + Number(log.gramsUsed));
  };

  const deleteOne = async (returnToSpool: boolean) => {
    if (!confirmAction || confirmAction.type !== "single") return;
    const log = logs.find((item) => item.id === confirmAction.id);
    try {
      if (returnToSpool && log) await returnFilament(log);
      await deleteLog(confirmAction.id);
      toast.success("Print log deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete print log");
    } finally {
      setConfirmAction(null);
    }
  };

  const clearAll = async (returnToSpools: boolean) => {
    try {
      if (returnToSpools) {
        const gramsBySpool = new Map<number, number>();
        for (const log of logs) {
          if (!log.filamentId || !log.gramsUsed) continue;
          gramsBySpool.set(log.filamentId, (gramsBySpool.get(log.filamentId) ?? 0) + Number(log.gramsUsed));
        }
        for (const [spoolId, totalGrams] of gramsBySpool) {
          const spool = filaments.find((f) => f.id === spoolId);
          if (!spool) continue;
          const current = spool.currentTotalWeight
            ? Number(spool.currentTotalWeight)
            : Number(spool.remainingGrams ?? 0) + Number(spool.emptySpoolWeight ?? 0);
          await recalibrateFilament(spoolId, current + totalGrams);
        }
      }
      await clearLogs();
      toast.success("Print log cleared");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear print log");
    } finally {
      setConfirmAction(null);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError("");
    const spool = filaments.find((f) => String(f.id) === filamentId);
    const used = Number(flow === "reprint" ? selectedTemplate?.estimatedGrams : gramsUsedInput);
    const printName = flow === "reprint" ? selectedTemplate?.name : name;
    if (!spool || !used || !printName) return toast.error("Missing print info");
    const beforeRemaining = spool.remainingGrams !== null ? Number(spool.remainingGrams) : null;
    const afterRemaining = beforeRemaining === null ? null : Math.max(0, beforeRemaining - used);
    const current = spool.currentTotalWeight
      ? Number(spool.currentTotalWeight)
      : Number(spool.remainingGrams ?? 0) + Number(spool.emptySpoolWeight ?? 0);
    setIsSavingPrint(true);
    try {
      const createdLog = await addLog({
        name: printName,
        description: flow === "reprint" ? selectedTemplate?.description ?? null : description || null,
        filamentId: spool.id,
        filamentLabel: `${spool.brand} ${spool.colorName ?? spool.materialFamily}`,
        gramsUsed: used,
        filamentBeforeGrams: beforeRemaining,
        filamentAfterGrams: afterRemaining,
        mode: flow === "reprint" ? "reprint" : saveTemplate ? "new" : "one_time",
      });

      try {
        await recalibrateFilament(spool.id, Math.max(0, current - used));
      } catch (updateError) {
        if (createdLog?.id) {
          await deleteLog(createdLog.id).catch((rollbackError) => {
            if (import.meta.env.DEV) console.error("[Prints] Failed to roll back print log", rollbackError);
          });
        }
        throw updateError;
      }

      if (flow === "new" && saveTemplate) {
        try {
          await addTemplate({ name, description: description || null, estimatedGrams: used, estimatedCost: null });
        } catch (templateError) {
          const message = templateError instanceof Error ? templateError.message : "Quick-print template was not saved.";
          if (import.meta.env.DEV) console.warn("[Prints] Quick-print template save failed", templateError);
          toast.warning(`Print logged, but quick-print was not saved. ${message}`);
        }
      }

      toast.success("Print logged");
      resetFlow();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save print";
      setSaveError(message);
      toast.error(message);
      if (import.meta.env.DEV) console.error("[Prints] Save print failed", err);
    } finally {
      setIsSavingPrint(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Prints</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Log prints and reuse quick-print templates</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setConfirmAction({ type: "clear" })} disabled={logs.length === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40" style={{ background: "oklch(0.55 0.20 25 / 0.12)", color: "oklch(0.55 0.20 25)", border: "1px solid oklch(0.55 0.20 25 / 0.28)" }}>
              <Trash2 className="w-4 h-4" /> Clear Print Log
            </button>
            <button onClick={() => setFlow("choose")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>
              <Plus className="w-4 h-4" /> Log a Print
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 space-y-5">
        {flow === null && (
          <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
            <button onClick={() => setFlow("new")} className="rounded-xl p-4 text-left transition hover:bg-accent" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="font-semibold">New print</p>
              <p className="text-xs text-muted-foreground mt-1">Create one-time print or save quick-print.</p>
            </button>
            <button onClick={() => setFlow("reprint")} className="rounded-xl p-4 text-left transition hover:bg-accent" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="font-semibold">Reprint</p>
              <p className="text-xs text-muted-foreground mt-1">Reuse saved quick-print template.</p>
            </button>
          </div>
        )}

        {flow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => { if (!isSavingPrint) resetFlow(); }} />
            <div className="relative z-10 w-full max-w-lg mx-4 animate-scale-in">
              <div className="w-full rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: "oklch(0.78 0.16 85 / 0.13)", color: "var(--gold)" }}><Printer className="w-4 h-4" /></div>
                    <h2 className="text-base font-semibold">{flow === "choose" ? "Log a Print" : flow === "new" ? "New Print" : "Reprint"}</h2>
                  </div>
                  <button onClick={resetFlow} disabled={isSavingPrint} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"><X className="w-4 h-4" /></button>
                </div>

                {flow === "choose" ? (
                  <div className="p-5 grid gap-3">
                    <button onClick={() => setFlow("new")} className="rounded-xl p-4 text-left transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
                      <p className="font-semibold">New print</p>
                      <p className="text-xs text-muted-foreground mt-1">Create one-time print or save quick-print.</p>
                    </button>
                    <button onClick={() => setFlow("reprint")} className="rounded-xl p-4 text-left transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
                      <p className="font-semibold">Reprint</p>
                      <p className="text-xs text-muted-foreground mt-1">Reuse saved quick-print template.</p>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <div className="p-5 space-y-3">
                      {flow === "new" ? (
                        <>
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="Print name" style={FIELD_STYLE} />
                          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} style={{ ...FIELD_STYLE, resize: "vertical" }} />
                          <input type="number" value={gramsUsedInput} onChange={e => setGramsUsedInput(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Grams used" style={FIELD_STYLE} />
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={saveTemplate} onChange={e => setSaveTemplate(e.target.checked)} /> Save as quick-print</label>
                        </>
                      ) : (
                        <button type="button" onClick={() => { setSidePanel(sidePanel === "template" ? null : "template"); setTemplateSearch(selectedTemplate?.name ?? ""); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm" style={FIELD_STYLE}>
                          <span>{selectedTemplate ? `${selectedTemplate.name} — ${selectedTemplate.estimatedGrams}g` : "Search quick-prints"}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <button type="button" onClick={() => { setSidePanel(sidePanel === "spool" ? null : "spool"); setSpoolSearch(selectedSpool ? spoolLabel(selectedSpool) : ""); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left" style={FIELD_STYLE}>
                        <span>{selectedSpool ? spoolLabel(selectedSpool) : "Search spools"}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </button>
                      {saveError && (
                        <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "oklch(0.55 0.20 25 / 0.10)", color: "oklch(0.62 0.20 25)", border: "1px solid oklch(0.55 0.20 25 / 0.25)" }}>
                          {saveError}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between gap-3 px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <button type="button" onClick={resetFlow} disabled={isSavingPrint} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50">Cancel</button>
                      <button disabled={isSavingPrint} className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>{isSavingPrint ? "Saving…" : "Save print"}</button>
                    </div>
                  </form>
                )}
              </div>

              {sidePanel === "spool" && (
                <div className="fixed bottom-4 left-4 right-4 z-30 max-h-[45vh] overflow-hidden rounded-2xl shadow-2xl animate-slide-up lg:absolute lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[520px] lg:w-80 lg:max-h-[90vh] lg:-translate-y-1/2 lg:translate-x-[17.5rem] lg:animate-slide-right" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}><span className="text-sm font-semibold">Choose Spool</span><button onClick={() => setSidePanel(null)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-3.5 h-3.5" /></button></div>
                  <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}><input autoFocus value={spoolSearch} onChange={e => setSpoolSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && filteredSpools[0]) { setFilamentId(String(filteredSpools[0].id)); setSpoolSearch(spoolLabel(filteredSpools[0])); setSidePanel(null); } }} placeholder="Type brand, material, color..." style={FIELD_STYLE} /></div>
                  <div className="overflow-y-auto p-2">{filteredSpools.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No matching spools found.</p> : filteredSpools.map(f => <button key={f.id} onClick={() => { setFilamentId(String(f.id)); setSpoolSearch(spoolLabel(f)); setSidePanel(null); }} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><span>{spoolLabel(f)}</span>{filamentId === String(f.id) && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}</button>)}</div>
                </div>
              )}
              {sidePanel === "template" && (
                <div className="fixed bottom-4 left-4 right-4 z-30 max-h-[45vh] overflow-hidden rounded-2xl shadow-2xl animate-slide-up lg:absolute lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:h-[520px] lg:w-80 lg:max-h-[90vh] lg:-translate-y-1/2 lg:translate-x-[17.5rem] lg:animate-slide-right" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}><span className="text-sm font-semibold">Choose Quick-Print</span><button onClick={() => setSidePanel(null)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-3.5 h-3.5" /></button></div>
                  <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}><input autoFocus value={templateSearch} onChange={e => setTemplateSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && filteredTemplates[0]) { setTemplateId(String(filteredTemplates[0].id)); setTemplateSearch(filteredTemplates[0].name); setSidePanel(null); } }} placeholder="Type print name or description..." style={FIELD_STYLE} /></div>
                  <div className="overflow-y-auto p-2">{filteredTemplates.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No matching saved prints found.</p> : filteredTemplates.map(t => <button key={t.id} onClick={() => { setTemplateId(String(t.id)); setTemplateSearch(t.name); setSidePanel(null); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><span>{t.name} — {t.estimatedGrams}g</span>{templateId === String(t.id) && <Check className="w-3.5 h-3.5 text-primary" />}</button>)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <section className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h2 className="text-base font-semibold mb-3">Print log</h2>
          {isLoading ? <div className="h-24 skeleton rounded-lg" /> : logs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground"><Printer className="w-10 h-10 mx-auto mb-2" />No prints logged.</div>
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{log.name}</p>
                      <p className="text-xs text-muted-foreground">{log.description || "No description"}</p>
                      <p className="text-xs text-muted-foreground">{log.filamentLabel}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground">{formatGrams(log.gramsUsed)}</p>
                      <p>{log.mode}</p>
                      <p>{formatPrintDate(log.printedAt)}</p>
                    </div>
                    <button onClick={() => setConfirmAction({ type: "single", id: log.id })} className="self-start rounded-lg p-2 transition hover:bg-destructive/10" style={{ color: "oklch(0.55 0.20 25)" }} title="Delete print log">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg p-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div><p className="text-[10px] uppercase text-muted-foreground">Before</p><p className="text-xs font-semibold">{formatGrams(log.filamentBeforeGrams)}</p></div>
                    <div><p className="text-[10px] uppercase text-muted-foreground">Used</p><p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>{formatGrams(log.gramsUsed)}</p></div>
                    <div><p className="text-[10px] uppercase text-muted-foreground">After</p><p className="text-xs font-semibold">{formatGrams(log.filamentAfterGrams)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmAction(null)} />
          <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border p-5 shadow-2xl animate-scale-in" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{confirmAction.type === "clear" ? "Clear Print Log" : "Delete Print Log"}</h2>
              <button onClick={() => setConfirmAction(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-4 h-4" /></button>
            </div>
            {confirmAction.type === "clear" ? (
              <div className="space-y-3">
                <button onClick={() => clearAll(true)} className="w-full rounded-xl p-4 text-left font-semibold transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>Clear and return filament to spools</button>
                <button onClick={() => clearAll(false)} className="w-full rounded-xl p-4 text-left font-semibold transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>Clear without returning filament</button>
                <button onClick={() => setConfirmAction(null)} className="w-full rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">Cancel</button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => deleteOne(true)} className="w-full rounded-xl p-4 text-left font-semibold transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>Yes, delete — return filament to spool</button>
                <button onClick={() => deleteOne(false)} className="w-full rounded-xl p-4 text-left font-semibold transition hover:bg-accent" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>Yes, delete — don’t return filament</button>
                <button onClick={() => setConfirmAction(null)} className="w-full rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "oklch(0.55 0.20 25 / 0.12)", color: "oklch(0.55 0.20 25)", border: "1px solid oklch(0.55 0.20 25 / 0.24)" }}>No, don’t delete</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
