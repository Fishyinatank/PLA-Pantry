import { getAuthAccessToken, setAuthAccessToken } from "@/lib/authToken";
import {
  isSupabaseConfigured,
  missingSupabaseMessage,
  supabase,
  supabaseConfig,
  type SupabaseSession,
  type SupabaseUser,
} from "@/lib/supabase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";

const DEV_SESSION_KEY = "pla-pantry-dev-session";

export type AuthSource = "supabase" | "dev";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  source: AuthSource;
};

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AppUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  isDevMode: boolean;
  isSupabaseConfigured: boolean;
  devLoginEnabled: boolean;
  providerNotice: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  continueInDevMode: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEV_USER: AppUser = {
  id: "dev-vishrut",
  name: "Vishrut Sathyanarayanan",
  email: "dev@plapantry.local",
  role: "user",
  source: "dev",
};

function getDisplayName(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};
  return String(
    metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      user.email?.split("@")[0] ||
      "PLA Pantry User"
  );
}

function toAppUser(user: SupabaseUser): AppUser {
  return {
    id: user.id,
    name: getDisplayName(user),
    email: user.email ?? "",
    role: user.app_metadata?.role === "admin" ? "admin" : "user",
    source: "supabase",
  };
}

function readDevSession() {
  if (!supabaseConfig.enableDevLogin || typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(DEV_SESSION_KEY) === "true";
}

function requireSupabase() {
  if (!supabase) throw new Error(missingSupabaseMessage);
  return supabase;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const applySession = useCallback((nextSession: SupabaseSession | null) => {
    setSession(nextSession);
    setAuthAccessToken(nextSession?.access_token ?? null);
    setUser(nextSession?.user ? toAppUser(nextSession.user) : null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (readDevSession()) {
          setAuthAccessToken(null);
          setSession(null);
          setUser(DEV_USER);
          return;
        }

        if (!supabase) {
          applySession(null);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) applySession(data.session);
      } catch (error) {
        console.error("[Auth] Failed to restore session", error);
        if (mounted) applySession(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    initialize();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted || readDevSession()) return;
      applySession(nextSession);
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const client = requireSupabase();
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        applySession(data.session);
        navigate("/");
      } finally {
        setLoading(false);
      }
    },
    [applySession, navigate]
  );

  const signUpWithEmail = useCallback(
    async ({ name, email, password }: SignUpInput) => {
      setLoading(true);
      try {
        const client = requireSupabase();
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: supabaseConfig.redirectTo,
          },
        });
        if (error) throw error;
        applySession(data.session);
        if (data.session) navigate("/");
      } finally {
        setLoading(false);
      }
    },
    [applySession, navigate]
  );

  const signInWithProvider = useCallback(async (provider: "google" | "apple") => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: supabaseConfig.redirectTo },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DEV_SESSION_KEY);
      }
      if (supabase && getAuthAccessToken()) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      applySession(null);
      setUser(null);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [applySession, navigate]);

  const continueInDevMode = useCallback(async () => {
    if (!supabaseConfig.enableDevLogin) {
      throw new Error("Dev login is disabled. Set VITE_ENABLE_DEV_LOGIN=true to enable it locally.");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEV_SESSION_KEY, "true");
    }
    setAuthAccessToken(null);
    setSession(null);
    setUser(DEV_USER);
    navigate("/");
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      initialized,
      isAuthenticated: Boolean(user),
      isDevMode: user?.source === "dev",
      isSupabaseConfigured,
      devLoginEnabled: supabaseConfig.enableDevLogin,
      providerNotice: isSupabaseConfigured ? null : missingSupabaseMessage,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle: () => signInWithProvider("google"),
      signInWithApple: () => signInWithProvider("apple"),
      signOut,
      continueInDevMode,
    }),
    [
      user,
      session,
      loading,
      initialized,
      signInWithEmail,
      signUpWithEmail,
      signInWithProvider,
      signOut,
      continueInDevMode,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
