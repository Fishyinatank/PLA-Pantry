import { BRANDS, MATERIAL_FAMILIES, MATERIAL_SUBTYPES } from "@/lib/filamentData";
import { loadDevReferenceRows } from "@/lib/devReferenceStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ReferenceData = {
  brands: string[];
  materialFamilies: string[];
  materialSubtypes: Record<string, string[]>;
};

export const FALLBACK_REFERENCE_DATA: ReferenceData = {
  brands: [...BRANDS].sort((a, b) => a.localeCompare(b)),
  materialFamilies: [...MATERIAL_FAMILIES],
  materialSubtypes: MATERIAL_SUBTYPES,
};

const sortText = (items: string[]) =>
  Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));

export async function loadReferenceData(token?: string): Promise<ReferenceData> {
  if (!isSupabaseConfigured) return FALLBACK_REFERENCE_DATA;

  const { brands: brandRows, families: familyRows, subtypes: subtypeRows } =
    await loadDevReferenceRows(token);

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

  const reload = useCallback(async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadReferenceData(token));
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
