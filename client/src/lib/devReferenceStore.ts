import { supabaseRequest } from "@/lib/supabaseRest";

export type DevBrandRow = { id: number; name: string; created_at: string; updated_at: string };
export type DevFamilyRow = { id: number; name: string; created_at: string; updated_at: string };
export type DevSubtypeRow = {
  id: number;
  family_id: number;
  name: string;
  created_at: string;
  material_families?: { name: string } | null;
};

export async function loadDevReferenceRows(token: string) {
  const [brands, families, subtypes] = await Promise.all([
    supabaseRequest<DevBrandRow[]>("filament_brands?select=*&order=name.asc", { token }),
    supabaseRequest<DevFamilyRow[]>("material_families?select=*&order=name.asc", { token }),
    supabaseRequest<DevSubtypeRow[]>(
      "material_subtypes?select=*,material_families(name)&order=name.asc",
      { token }
    ),
  ]);
  return { brands, families, subtypes };
}

export function createBrand(token: string, name: string) {
  return supabaseRequest<DevBrandRow[]>("filament_brands?select=*", {
    token,
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function updateBrand(token: string, id: number, name: string) {
  return supabaseRequest<void>(`filament_brands?id=eq.${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function deleteBrand(token: string, id: number) {
  return supabaseRequest<void>(`filament_brands?id=eq.${id}`, { token, method: "DELETE" });
}

export function createFamily(token: string, name: string) {
  return supabaseRequest<DevFamilyRow[]>("material_families?select=*", {
    token,
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function updateFamily(token: string, id: number, name: string) {
  return supabaseRequest<void>(`material_families?id=eq.${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function deleteFamily(token: string, id: number) {
  return supabaseRequest<void>(`material_families?id=eq.${id}`, { token, method: "DELETE" });
}

export function createSubtype(token: string, familyId: number, name: string) {
  return supabaseRequest<DevSubtypeRow[]>("material_subtypes?select=*", {
    token,
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ family_id: familyId, name: name.trim() }),
  });
}

export function updateSubtype(token: string, id: number, name: string) {
  return supabaseRequest<void>(`material_subtypes?id=eq.${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function deleteSubtype(token: string, id: number) {
  return supabaseRequest<void>(`material_subtypes?id=eq.${id}`, { token, method: "DELETE" });
}
