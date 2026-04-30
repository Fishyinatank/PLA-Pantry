import { useAuth } from "@/_core/hooks/useAuth";
import DevGate, { DEV_CONFIRMED_KEY, clearDevConfirmation } from "@/components/dev/DevGate";
import { checkDeveloperAccess } from "@/lib/devAccessStore";
import { useEffect, useState } from "react";

export default function DevProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();
  const [allowed, setAllowed] = useState<"checking" | "yes" | "no">("checking");

  useEffect(() => {
    let mounted = true;
    async function verify() {
      if (loading) return;
      const confirmedEmail = typeof window !== "undefined" ? window.sessionStorage.getItem(DEV_CONFIRMED_KEY) : null;
      if (!session?.access_token || !user?.email || confirmedEmail !== user.email.toLowerCase()) {
        setAllowed("no");
        return;
      }
      try {
        const ok = await checkDeveloperAccess(user.email, session.access_token);
        if (mounted) setAllowed(ok ? "yes" : "no");
        if (!ok) clearDevConfirmation();
      } catch {
        if (mounted) setAllowed("no");
        clearDevConfirmation();
      }
    }
    void verify();
    return () => {
      mounted = false;
    };
  }, [loading, session?.access_token, user?.email]);

  if (loading || allowed === "checking") {
    return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Checking developer access…</div>;
  }

  if (allowed !== "yes") return <DevGate />;
  return <>{children}</>;
}
