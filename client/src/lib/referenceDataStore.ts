import { BRANDS, MATERIAL_FAMILIES, MATERIAL_SUBTYPES } from "@/lib/filamentData";
import { isSupabaseConfigured } from "@/lib/supabase";
import { supabaseRequest } from "@/lib/supabaseRest";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ReferenceData = {
  brands: string[];
  materialFamilies: string[];
  materialSubtypes: Record<string, string[]>;
};

type BrandRow = { name: string };
type FamilyRow = { id: number; name: string };
type SubtypeRow = { family_id: number; name: string };

export const FALLBACK_REFERENCE_DATA: ReferenceData = {
  brands: [...BRANDS].sort((a, b) => a.localeCompare(b)),
  materialFamilies: [...MATERIAL_FAMILIES],
  materialSubtypes: MATERIAL_SUBTYPES,
};

const sortText = (items: string[]) =>
  Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));

export async function loadReferenceData(): Promise<ReferenceData> {
  if (!isSupabaseConfigured) return FALLBACK_REFERENCE_DATA;

  const [brandRows, familyRows, subtypeRows] = await Promise.all([
    supabaseRequest<BrandRow[]>("filament_brands?select=name&order=name.asc"),
    supabaseRequest<FamilyRow[]>("material_families?select=id,name&order=name.asc"),
    supabaseRequest<SubtypeRow[]>("material_subtypes?select=family_id,name&order=name.asc"),
  ]);

  const familyById = new Map(familyRows.map((family) => [family.id, family.name]));
  const materialSubtypes: Record<string, string[]> = {};
  for (const subtype of subtypeRows) {
    const family = familyById.get(subtype.family_id);
    if (!family) continue;
    materialSubtypes[family] = [...(materialSubtypes[family] ?? []), subtype.name];
  }

  for (const family of familyRows) {
    materialSubtypes[family.name] = sortText(materialSubtypes[family.name] ?? ["Standard"]);
  }

  return {
    brands: sortText(brandRows.map((row) => row.name)),
    materialFamilies: familyRows.map((row) => row.name),
    materialSubtypes,
  };
}

export function useReferenceData() {
  const [data, setData] = useState<ReferenceData>(FALLBACK_REFERENCE_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadReferenceData());
    } catch (err) {
      setData(FALLBACK_REFERENCE_DATA);
      setError(err instanceof Error ? err : new Error("Failed to load reference data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return useMemo(() => ({ data, loading, error, reload }), [data, error, loading, reload]);
}
