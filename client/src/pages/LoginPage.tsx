import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Apple, Loader2, Lock, Mail, Package } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div
        className="absolute inset-0 opacity-45"
        style={{ background: "var(--auth-gradient)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: "var(--auth-dot)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        {children}
      </div>
    </main>
  );
}

function ProviderIcon({ provider }: { provider: "google" | "apple" }) {
  if (provider === "apple") return <Apple className="h-4 w-4" />;
  return (
    <span className="grid h-4 w-4 place-items-center rounded-full bg-white text-[10px] font-bold text-black">
      G
    </span>
  );
}

export default function LoginPage() {
  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    continueInDevMode,
    loading,
    providerNotice,
    devLoginEnabled,
    isSupabaseConfigured,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    const message = window.sessionStorage.getItem("pla-pantry-auth-message");
    if (message) {
      setNotice(message);
      window.sessionStorage.removeItem("pla-pantry-auth-message");
    }
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    try {
      setBusyAction("email");
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusyAction(null);
    }
  };

  const run = async (action: string, fn: () => Promise<void>) => {
    setError(null);
    try {
      setBusyAction(action);
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <AuthShell>
      <section
        className="w-full max-w-[440px] rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8 page-transition"
        style={{
          background: "var(--auth-card-bg)",
          borderColor: "var(--auth-card-border)",
          boxShadow: "var(--auth-card-shadow)",
        }}
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <div
            className="mb-4 grid h-14 w-14 place-items-center rounded-2xl"
            style={{
              background: "oklch(0.78 0.16 85 / 0.13)",
              border: "1px solid oklch(0.78 0.16 85 / 0.32)",
            }}
          >
            <Package className="h-7 w-7" style={{ color: "var(--gold)" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to PLA Pantry</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sync your filament inventory across every printer station.
          </p>
        </div>

        {providerNotice && (
          <div className="mb-4 flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs" style={{ color: "var(--auth-warning-text)" }}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{providerNotice}</span>
          </div>
        )}

        {notice && (
          <div className="mb-4 flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs" style={{ color: "var(--auth-warning-text)" }}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs" style={{ color: "var(--auth-error-text)" }}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
            <div className="flex items-center gap-2 rounded-lg border bg-input px-3" style={{ borderColor: "var(--border)" }}>
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
            <div className="flex items-center gap-2 rounded-lg border bg-input px-3" style={{ borderColor: "var(--border)" }}>
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading || busyAction !== null || !isSupabaseConfigured}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}
          >
            {busyAction === "email" && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => run("google", signInWithGoogle)}
            disabled={busyAction !== null || !isSupabaseConfigured}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border bg-secondary text-sm font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: "var(--border)" }}
          >
            {busyAction === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ProviderIcon provider="google" />}
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => run("apple", signInWithApple)}
            disabled={busyAction !== null || !isSupabaseConfigured}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border bg-secondary text-sm font-semibold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: "var(--border)" }}
          >
            {busyAction === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ProviderIcon provider="apple" />}
            Continue with Apple
          </button>
          {devLoginEnabled && (
            <button
              type="button"
              onClick={() => run("dev", continueInDevMode)}
              disabled={busyAction !== null}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 text-sm font-semibold transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: "var(--auth-dev-text)" }}
            >
              {busyAction === "dev" && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue in Dev Mode
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to PLA Pantry?{" "}
          <Link href="/signup" className="font-semibold" style={{ color: "var(--gold)" }}>
            Create an account
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
