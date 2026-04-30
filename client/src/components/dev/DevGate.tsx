import { useAuth } from "@/_core/hooks/useAuth";
import { checkDeveloperAccess } from "@/lib/devAccessStore";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export const DEV_CONFIRMED_KEY = "pla-pantry-dev-confirmed-email";

export function clearDevConfirmation() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(DEV_CONFIRMED_KEY);
}

export default function DevGate() {
  const { user, session, loading, isDevMode } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState(user?.source === "supabase" ? user.email : "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const signedIn = Boolean(user?.source === "supabase" && session?.access_token);

  async function confirm(accessToken = session?.access_token, nextEmail = user?.email) {
    if (!accessToken || !nextEmail) throw new Error("Sign in with Supabase first.");
    const allowed = await checkDeveloperAccess(nextEmail, accessToken);
    if (!allowed) throw new Error("Access denied.");
    window.sessionStorage.setItem(DEV_CONFIRMED_KEY, nextEmail.toLowerCase());
    navigate("/dev/filament-details");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (signedIn) {
        await confirm();
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await confirm(data.session?.access_token, data.session?.user.email ?? email);
    } catch (err) {
      clearDevConfirmation();
      setMessage(err instanceof Error ? err.message : "Access denied.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Checking…</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--auth-gradient)" }}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: "var(--auth-card-bg)", borderColor: "var(--auth-card-border)" }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "oklch(0.78 0.16 85 / 0.16)", color: "var(--gold)" }}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Developer access</h1>
            <p className="text-sm text-muted-foreground">Fresh verification required.</p>
          </div>
        </div>

        {isDevMode && (
          <div className="mb-4 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
            Dev Mode cannot open developer pages. Use Supabase login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!signedIn && (
            <>
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Developer email" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" className="w-full rounded-lg border px-3 py-2 text-sm" style={{ background: "var(--input)", borderColor: "var(--border)" }} />
            </>
          )}
          {signedIn && <p className="rounded-xl border px-3 py-2 text-sm text-muted-foreground" style={{ borderColor: "var(--border)" }}>Signed in as {user?.email}. Confirm dev access to continue.</p>}
          {message && <p className="text-sm" style={{ color: "var(--auth-error-text)" }}>{message}</p>}
          <button disabled={busy || isDevMode} className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>
            {busy ? "Checking…" : signedIn ? "Continue to Developer Console" : "Sign in and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
