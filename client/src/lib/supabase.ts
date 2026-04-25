const SESSION_KEY = "pla-pantry-supabase-session";

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  user: SupabaseUser;
};

type AuthChangeCallback = (
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED",
  session: SupabaseSession | null
) => void;

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, "") ?? "",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "",
  redirectTo:
    import.meta.env.VITE_SUPABASE_AUTH_REDIRECT_URL?.trim() ||
    (typeof window !== "undefined" ? `${window.location.origin}/` : ""),
  enableDevLogin: import.meta.env.VITE_ENABLE_DEV_LOGIN === "true",
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey
);

export const missingSupabaseMessage =
  "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable production auth.";

function authUrl(path: string) {
  return `${supabaseConfig.url}/auth/v1${path}`;
}

function authHeaders(token?: string) {
  return {
    apikey: supabaseConfig.anonKey,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function readStoredSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function storeSession(session: SupabaseSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      json.error_description ||
      json.msg ||
      json.message ||
      "Supabase authentication request failed.";
    throw new Error(message);
  }
  return json as T;
}

async function getUser(accessToken: string) {
  const response = await fetch(authUrl("/user"), {
    headers: authHeaders(accessToken),
  });
  return parseResponse<SupabaseUser>(response);
}

function readRedirectSession() {
  if (typeof window === "undefined" || !window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  if (!accessToken) return null;
  const refreshToken = params.get("refresh_token") ?? undefined;
  const expiresIn = Number(params.get("expires_in") ?? 0);
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  return {
    accessToken,
    refreshToken,
    expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
  };
}

function createSupabaseAuthClient() {
  const listeners = new Set<AuthChangeCallback>();

  const emit = (
    event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED",
    session: SupabaseSession | null
  ) => {
    listeners.forEach((listener) => listener(event, session));
  };

  return {
    auth: {
      async getSession() {
        const redirectSession = readRedirectSession();
        if (redirectSession) {
          const user = await getUser(redirectSession.accessToken);
          const session: SupabaseSession = {
            access_token: redirectSession.accessToken,
            refresh_token: redirectSession.refreshToken,
            expires_at: redirectSession.expiresAt,
            token_type: "bearer",
            user,
          };
          storeSession(session);
          emit("SIGNED_IN", session);
          return { data: { session }, error: null };
        }

        const session = readStoredSession();
        if (!session?.access_token) return { data: { session: null }, error: null };
        const user = await getUser(session.access_token);
        const refreshedSession = { ...session, user };
        storeSession(refreshedSession);
        return { data: { session: refreshedSession }, error: null };
      },

      async signInWithPassword(input: { email: string; password: string }) {
        const response = await fetch(authUrl("/token?grant_type=password"), {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(input),
        });
        const session = await parseResponse<SupabaseSession>(response);
        storeSession(session);
        emit("SIGNED_IN", session);
        return { data: { session }, error: null };
      },

      async signUp(input: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown>; emailRedirectTo?: string };
      }) {
        const response = await fetch(authUrl("/signup"), {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            email: input.email,
            password: input.password,
            data: input.options?.data,
            email_redirect_to: input.options?.emailRedirectTo,
          }),
        });
        const data = await parseResponse<SupabaseSession | { user: SupabaseUser }>(response);
        const session = "access_token" in data ? data : null;
        if (session) {
          storeSession(session);
          emit("SIGNED_IN", session);
        }
        return { data: { session }, error: null };
      },

      async signInWithOAuth({
        provider,
        options,
      }: {
        provider: "google" | "apple";
        options?: { redirectTo?: string };
      }) {
        const redirectTo = encodeURIComponent(options?.redirectTo || supabaseConfig.redirectTo);
        window.location.href = authUrl(
          `/authorize?provider=${provider}&redirect_to=${redirectTo}`
        );
        return { error: null };
      },

      async signOut() {
        const session = readStoredSession();
        if (session?.access_token) {
          await fetch(authUrl("/logout"), {
            method: "POST",
            headers: authHeaders(session.access_token),
          }).catch(() => null);
        }
        storeSession(null);
        emit("SIGNED_OUT", null);
        return { error: null };
      },

      async refreshSession() {
        const session = readStoredSession();
        if (!session?.refresh_token) {
          throw new Error("No refresh token available.");
        }
        const response = await fetch(authUrl("/token?grant_type=refresh_token"), {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
        const refreshed = await parseResponse<SupabaseSession>(response);
        storeSession(refreshed);
        emit("TOKEN_REFRESHED", refreshed);
        return { data: { session: refreshed }, error: null };
      },

      onAuthStateChange(callback: AuthChangeCallback) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(callback),
            },
          },
        };
      },
    },
  };
}

export const supabase = isSupabaseConfigured ? createSupabaseAuthClient() : null;
