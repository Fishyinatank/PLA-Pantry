import { supabaseRequest } from "@/lib/supabaseRest";

export const PROTECTED_DEV_EMAIL = "vishrutsn@gmail.com";

export type DeveloperAccess = {
  id: number;
  email: string;
  created_at: string;
  created_by: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  is_protected: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isProtectedDevEmail(email?: string | null) {
  return normalizeEmail(email ?? "") === PROTECTED_DEV_EMAIL;
}

export function isActiveDeveloper(row: DeveloperAccess) {
  if (row.is_protected || isProtectedDevEmail(row.email)) return true;
  if (row.revoked_at) return false;
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return false;
  return true;
}

export async function checkDeveloperAccess(email: string, token: string) {
  const rows = await supabaseRequest<DeveloperAccess[]>(
    `developer_access?select=*&email=eq.${encodeURIComponent(normalizeEmail(email))}&limit=1`,
    { token }
  );
  return Boolean(rows[0] && isActiveDeveloper(rows[0]));
}

export async function listDeveloperAccess(token: string) {
  return supabaseRequest<DeveloperAccess[]>("developer_access?select=*&order=email.asc", { token });
}

export async function addDeveloperAccess(token: string, email: string, expiresAt: string | null) {
  return supabaseRequest<DeveloperAccess[]>("developer_access?select=*", {
    token,
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      email: normalizeEmail(email),
      expires_at: expiresAt,
    }),
  });
}

export async function revokeDeveloperAccess(token: string, id: number) {
  return supabaseRequest<void>(`developer_access?id=eq.${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ revoked_at: new Date().toISOString() }),
  });
}
