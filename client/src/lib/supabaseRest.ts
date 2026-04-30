import { supabaseConfig } from "@/lib/supabase";

export function supabaseRestUrl(path: string) {
  return `${supabaseConfig.url}/rest/v1/${path}`;
}

export async function supabaseRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error("Supabase is not configured.");
  }

  const { token, headers, ...init } = options;
  const response = await fetch(supabaseRestUrl(path), {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Supabase request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
