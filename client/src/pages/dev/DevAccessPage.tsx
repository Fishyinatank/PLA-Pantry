import { useAuth } from "@/_core/hooks/useAuth";
import {
  addDeveloperAccess,
  isActiveDeveloper,
  isProtectedDevEmail,
  listDeveloperAccess,
  revokeDeveloperAccess,
  type DeveloperAccess,
} from "@/lib/devAccessStore";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DURATIONS = [
  { label: "1 day", value: "1d", ms: 24 * 60 * 60 * 1000 },
  { label: "7 days", value: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days", value: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "Never", value: "never", ms: null },
];

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
}

export default function DevAccessPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? "";
  const [rows, setRows] = useState<DeveloperAccess[]>([]);
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState("never");
  const [customExpiry, setCustomExpiry] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setRows(await listDeveloperAccess(token));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load dev access");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const expiresAt = useMemo(() => {
    if (customExpiry) return new Date(customExpiry).toISOString();
    const selected = DURATIONS.find((item) => item.value === duration);
    if (!selected?.ms) return null;
    return new Date(Date.now() + selected.ms).toISOString();
  }, [customExpiry, duration]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    try {
      await addDeveloperAccess(token, email, isProtectedDevEmail(email) ? null : expiresAt);
      setEmail("");
      setCustomExpiry("");
      setDuration("never");
      await load();
      toast.success("Developer access added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add developer");
    }
  }

  async function revoke(row: DeveloperAccess) {
    if (row.is_protected || isProtectedDevEmail(row.email)) return;
    try {
      await revokeDeveloperAccess(token, row.id);
      await load();
      toast.success("Access revoked.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke access");
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading dev access…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dev Access</h1>
        <p className="text-sm text-muted-foreground">Manage who can open the hidden developer console.</p>
      </div>

      <section className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="developer@example.com" className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
          <select value={duration} onChange={(event) => setDuration(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }}>
            {DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input value={customExpiry} onChange={(event) => setCustomExpiry(event.target.value)} type="datetime-local" className="rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
          <button className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_120px_72px] gap-3 border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground" style={{ borderColor: "var(--border)" }}>
          <span>Email</span>
          <span>Created</span>
          <span>Expires</span>
          <span>Status</span>
          <span></span>
        </div>
        {rows.map((row) => {
          const protectedRow = row.is_protected || isProtectedDevEmail(row.email);
          const active = isActiveDeveloper(row);
          return (
            <div key={row.id} className="grid grid-cols-[1.4fr_1fr_1fr_120px_72px] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex min-w-0 items-center gap-2">
                {protectedRow && <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />}
                <span className="truncate">{row.email}</span>
              </div>
              <span className="text-muted-foreground">{formatDate(row.created_at)}</span>
              <span className="text-muted-foreground">{formatDate(row.expires_at)}</span>
              <span className={active ? "text-emerald-500" : "text-muted-foreground"}>{active ? "Active" : "Inactive"}</span>
              <button
                disabled={protectedRow}
                onClick={() => revoke(row)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                title={protectedRow ? "Protected developer cannot be revoked" : "Revoke access"}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No developer access rows found.</p>}
      </section>
    </div>
  );
}
