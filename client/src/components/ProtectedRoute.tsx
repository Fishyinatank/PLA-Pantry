import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { initialized, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location)}`, { replace: true });
    }
  }, [initialized, isAuthenticated, location, navigate]);

  if (!initialized) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-11 w-11 rounded-full border-2 animate-spin"
            style={{
              borderColor: "oklch(0.78 0.16 85 / 0.25)",
              borderTopColor: "var(--gold)",
            }}
          />
          <p className="text-sm text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
