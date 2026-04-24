import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Apple, Loader2, Lock, Mail, Package, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div
        className="absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, oklch(0.78 0.16 85 / 0.18), transparent 34%), linear-gradient(135deg, oklch(0.10 0.005 240), oklch(0.15 0.012 240))",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.96 0.005 240) 1px, transparent 1px)",
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

export default function SignUpPage() {
  const {
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    loading,
    providerNotice,
    isSupabaseConfigured,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError("Enter your name, email, and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setBusyAction("email");
      await signUpWithEmail({ name: name.trim(), email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed.");
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
        className="w-full max-w-[460px] rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        style={{
          background: "oklch(0.13 0.008 240 / 0.88)",
          borderColor: "oklch(0.78 0.16 85 / 0.22)",
          boxShadow: "0 24px 80px oklch(0 0 0 / 0.42)",
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
          <h1 className="text-2xl font-bold tracking-tight">Create your PLA Pantry account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start tracking spools, materials, and low-stock alerts.
          </p>
        </div>

        {providerNotice && (
          <div className="mb-4 flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{providerNotice}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Full name</span>
            <div className="flex items-center gap-2 rounded-lg border bg-input px-3" style={{ borderColor: "var(--border)" }}>
              <User className="h-4 w-4 text-muted-foreground" />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          </label>
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm password</span>
            <div className="flex items-center gap-2 rounded-lg border bg-input px-3" style={{ borderColor: "var(--border)" }}>
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Repeat password"
                autoComplete="new-password"
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
            Create account
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
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--gold)" }}>
            Sign in
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
