import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { initialized, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);

  if (!initialized) return <div className="min-h-screen bg-background" />;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
