import { useAuth } from "@/_core/hooks/useAuth";
import {
  loadSupabaseOnboardingState,
  needsOnboarding,
  readDevOnboardingState,
  writeDevOnboardingComplete,
  writeSupabaseOnboardingComplete,
} from "@/lib/onboardingStore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";

type OnboardingContextValue = {
  open: boolean;
  loading: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
  completeTutorial: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, session, isDevMode, initialized } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const closeTutorial = useCallback(() => setOpen(false), []);
  const openTutorial = useCallback(() => setOpen(true), []);

  const completeTutorial = useCallback(async () => {
    try {
      if (isDevMode) {
        writeDevOnboardingComplete();
      } else if (user?.id && session?.access_token) {
        await writeSupabaseOnboardingComplete(user.id, session.access_token);
      }
    } finally {
      setOpen(false);
    }
  }, [isDevMode, session?.access_token, user?.id]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!initialized) return;
      setLoading(true);
      try {
        if (!user) {
          if (mounted) setOpen(false);
          return;
        }

        if (location.startsWith("/dev") || location === "/login" || location === "/signup") {
          if (mounted) setOpen(false);
          return;
        }

        if (isDevMode) {
          if (mounted) setOpen(needsOnboarding(readDevOnboardingState()));
          return;
        }

        if (!session?.access_token) return;
        const state = await loadSupabaseOnboardingState(user.id, session.access_token);
        if (mounted) setOpen(needsOnboarding(state));
      } catch {
        if (mounted) setOpen(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [initialized, isDevMode, location, session?.access_token, user]);

  const value = useMemo(
    () => ({ open, loading, openTutorial, closeTutorial, completeTutorial }),
    [closeTutorial, completeTutorial, loading, open, openTutorial]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
}
