import { supabaseConfig } from "@/lib/supabase";
import { supabaseRequest } from "@/lib/supabaseRest";
import { ONBOARDING_VERSION } from "@/lib/tutorialSteps";

const DEV_ONBOARDING_KEY = "pla-pantry-dev-onboarding";

export type OnboardingState = {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  onboarding_version: string | null;
};

type PreferenceRow = {
  user_id: string;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  onboarding_version: string | null;
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  onboarding_completed: false,
  onboarding_completed_at: null,
  onboarding_version: null,
};

export function needsOnboarding(state: OnboardingState | null) {
  if (!state?.onboarding_completed) return true;
  return state.onboarding_version !== ONBOARDING_VERSION;
}

export function readDevOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_ONBOARDING_STATE;
  const raw = window.localStorage.getItem(DEV_ONBOARDING_KEY);
  if (!raw) return DEFAULT_ONBOARDING_STATE;
  try {
    return { ...DEFAULT_ONBOARDING_STATE, ...JSON.parse(raw) };
  } catch {
    window.localStorage.removeItem(DEV_ONBOARDING_KEY);
    return DEFAULT_ONBOARDING_STATE;
  }
}

export function writeDevOnboardingComplete() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEV_ONBOARDING_KEY,
    JSON.stringify({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_version: ONBOARDING_VERSION,
    })
  );
}

export function writeDevOnboardingPending() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEV_ONBOARDING_KEY,
    JSON.stringify({
      onboarding_completed: false,
      onboarding_completed_at: null,
      onboarding_version: ONBOARDING_VERSION,
    })
  );
}

export async function loadSupabaseOnboardingState(userId: string, token: string): Promise<OnboardingState> {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return DEFAULT_ONBOARDING_STATE;
  const rows = await supabaseRequest<PreferenceRow[]>(
    `user_preferences?select=onboarding_completed,onboarding_completed_at,onboarding_version&user_id=eq.${userId}&limit=1`,
    { token }
  );
  const row = rows[0];
  if (!row) return DEFAULT_ONBOARDING_STATE;
  return {
    onboarding_completed: Boolean(row.onboarding_completed),
    onboarding_completed_at: row.onboarding_completed_at,
    onboarding_version: row.onboarding_version,
  };
}

export async function writeSupabaseOnboardingComplete(userId: string, token: string) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return;
  await supabaseRequest<PreferenceRow[]>("user_preferences?on_conflict=user_id", {
    token,
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: userId,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_version: ONBOARDING_VERSION,
    }),
  });
}

export async function writeSupabaseOnboardingPending(userId: string, token: string) {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) return;
  await supabaseRequest<PreferenceRow[]>("user_preferences?on_conflict=user_id", {
    token,
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: userId,
      onboarding_completed: false,
      onboarding_completed_at: null,
      onboarding_version: ONBOARDING_VERSION,
    }),
  });
}
