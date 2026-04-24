import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

const ENABLE_DEV_AUTH = process.env.ENABLE_DEV_AUTH === "true";

const LOCAL_DEV_USER: User = {
  id: 1,
  openId: "dev-vishrut",
  name: "Vishrut Sathyanarayanan",
  email: "dev@plapantry.local",
  loginMethod: "dev",
  role: "user",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function numericIdFromString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return Math.max(2, hash % 2_000_000_000);
}

function decodeJwtPayload(token: string): any | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

async function getSupabaseUser(token: string): Promise<User | null> {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  try {
    if (supabaseUrl && supabaseAnonKey) {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        const metadata = user.user_metadata ?? {};
        const name =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          user.email?.split("@")[0] ||
          "PLA Pantry User";
        return {
          ...LOCAL_DEV_USER,
          id: numericIdFromString(user.id),
          openId: user.id,
          name: String(name),
          email: user.email ?? null,
          loginMethod: "supabase",
        };
      }
    }
  } catch (error) {
    console.warn("[Auth] Supabase token verification failed", error);
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.sub) return null;

  return {
    ...LOCAL_DEV_USER,
    id: numericIdFromString(payload.sub),
    openId: payload.sub,
    name:
      payload.user_metadata?.full_name ||
      payload.user_metadata?.name ||
      payload.email?.split("@")[0] ||
      "PLA Pantry User",
    email: payload.email ?? null,
    loginMethod: "supabase",
  };
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const authHeader = opts.req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (bearerToken) {
    const supabaseUser = await getSupabaseUser(bearerToken);
    return {
      req: opts.req,
      res: opts.res,
      user: supabaseUser,
    };
  }

  if (ENABLE_DEV_AUTH) {
    return {
      req: opts.req,
      res: opts.res,
      user: LOCAL_DEV_USER,
    };
  }

  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}
