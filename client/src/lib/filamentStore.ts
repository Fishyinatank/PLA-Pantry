import { useAuth } from "@/contexts/AuthContext";
import { supabaseConfig } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEV_FILAMENTS_KEY = "pla-pantry-dev-filaments";

export type FilamentRecord = {
  id: number;
  userId: number;
  brand: string;
  productLine: string | null;
  materialFamily: string;
  materialSubtype: string | null;
  colorName: string | null;
  colorHex: string;
  advertisedWeight: string | null;
  spoolType: string | null;
  spoolMaterial: string | null;
  measurementMethod: "empty_spool" | "full_spool";
  emptySpoolWeight: string | null;
  fullSpoolWeight: string | null;
  currentTotalWeight: string | null;
  remainingGrams: string | null;
  remainingPercent: string | null;
  purchaseLink: string | null;
  supplier: string | null;
  price: string | null;
  datePurchased: Date | null;
  storageLocation: string | null;
  isDryBox: boolean | null;
  lastDriedAt: Date | null;
  notes: string | null;
  customLabels: string | null;
  isArchived: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FilamentInput = {
  brand: string;
  productLine?: string;
  materialFamily: string;
  materialSubtype?: string;
  colorName?: string;
  colorHex: string;
  advertisedWeight?: number;
  spoolType?: string;
  spoolMaterial?: string;
  measurementMethod: "empty_spool" | "full_spool";
  emptySpoolWeight?: number;
  fullSpoolWeight?: number;
  currentTotalWeight?: number;
  purchaseLink?: string;
  supplier?: string;
  price?: number;
  datePurchased?: Date;
  storageLocation?: string;
  isDryBox?: boolean;
  lastDriedAt?: Date;
  notes?: string;
  customLabels?: string;
};

type SupabaseFilamentRow = {
  id: number;
  user_id: string;
  brand: string;
  product_line: string | null;
  material_family: string;
  material_subtype: string | null;
  color_name: string | null;
  color_hex: string;
  advertised_weight: string | null;
  spool_type: string | null;
  spool_material: string | null;
  measurement_method: "empty_spool" | "full_spool";
  empty_spool_weight: string | null;
  full_spool_weight: string | null;
  current_total_weight: string | null;
  remaining_grams: string | null;
  remaining_percent: string | null;
  purchase_link: string | null;
  supplier: string | null;
  price: string | null;
  date_purchased: string | null;
  storage_location: string | null;
  is_dry_box: boolean | null;
  last_dried_at: string | null;
  notes: string | null;
  custom_labels: string | null;
  is_archived: boolean | null;
  created_at: string;
  updated_at: string;
};

export type FilamentStats = {
  totalSpools: number;
  totalGrams: number;
  lowStockCount: number;
  brandDistribution: { name: string; count: number }[];
  materialDistribution: { name: string; count: number }[];
  avgRemaining: number;
};

function numberString(value: number | undefined) {
  return value === undefined || Number.isNaN(value) ? null : String(value);
}

function calculateRemaining(data: Partial<FilamentInput>) {
  const advertised = data.advertisedWeight ?? null;
  const current = data.currentTotalWeight ?? null;

  if (current === null || current === undefined) {
    return { remainingGrams: null, remainingPercent: null };
  }

  if (data.measurementMethod === "empty_spool" && data.emptySpoolWeight != null) {
    const remaining = Math.max(0, current - data.emptySpoolWeight);
    const percent = advertised
      ? Math.min(100, Math.round((remaining / advertised) * 100))
      : null;
    return { remainingGrams: Math.round(remaining), remainingPercent: percent };
  }

  if (
    data.measurementMethod === "full_spool" &&
    data.fullSpoolWeight != null &&
    advertised
  ) {
    const emptySpool = data.fullSpoolWeight - advertised;
    const remaining = Math.max(0, current - emptySpool);
    const percent = Math.min(100, Math.round((remaining / advertised) * 100));
    return { remainingGrams: Math.round(remaining), remainingPercent: percent };
  }

  return { remainingGrams: null, remainingPercent: null };
}

function toFilament(row: SupabaseFilamentRow): FilamentRecord {
  return {
    id: row.id,
    userId: 0,
    brand: row.brand,
    productLine: row.product_line,
    materialFamily: row.material_family,
    materialSubtype: row.material_subtype,
    colorName: row.color_name,
    colorHex: row.color_hex,
    advertisedWeight: row.advertised_weight,
    spoolType: row.spool_type,
    spoolMaterial: row.spool_material,
    measurementMethod: row.measurement_method,
    emptySpoolWeight: row.empty_spool_weight,
    fullSpoolWeight: row.full_spool_weight,
    currentTotalWeight: row.current_total_weight,
    remainingGrams: row.remaining_grams,
    remainingPercent: row.remaining_percent,
    purchaseLink: row.purchase_link,
    supplier: row.supplier,
    price: row.price,
    datePurchased: row.date_purchased ? new Date(row.date_purchased) : null,
    storageLocation: row.storage_location,
    isDryBox: row.is_dry_box,
    lastDriedAt: row.last_dried_at ? new Date(row.last_dried_at) : null,
    notes: row.notes,
    customLabels: row.custom_labels,
    isArchived: row.is_archived,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toSupabasePayload(input: FilamentInput, userId?: string) {
  const remaining = calculateRemaining(input);
  return {
    ...(userId ? { user_id: userId } : {}),
    brand: input.brand,
    product_line: input.productLine ?? null,
    material_family: input.materialFamily,
    material_subtype: input.materialSubtype ?? null,
    color_name: input.colorName ?? null,
    color_hex: input.colorHex,
    advertised_weight: numberString(input.advertisedWeight),
    spool_type: input.spoolType ?? null,
    spool_material: input.spoolMaterial ?? null,
    measurement_method: input.measurementMethod,
    empty_spool_weight: numberString(input.emptySpoolWeight),
    full_spool_weight: numberString(input.fullSpoolWeight),
    current_total_weight: numberString(input.currentTotalWeight),
    remaining_grams: numberString(remaining.remainingGrams ?? undefined),
    remaining_percent: numberString(remaining.remainingPercent ?? undefined),
    purchase_link: input.purchaseLink ?? null,
    supplier: input.supplier ?? null,
    price: numberString(input.price),
    date_purchased: input.datePurchased?.toISOString() ?? null,
    storage_location: input.storageLocation ?? null,
    is_dry_box: input.isDryBox ?? false,
    last_dried_at: input.lastDriedAt?.toISOString() ?? null,
    notes: input.notes ?? null,
    custom_labels: input.customLabels ?? null,
  };
}

function makeDevFilament(input: FilamentInput, id = Date.now()): FilamentRecord {
  const now = new Date();
  const remaining = calculateRemaining(input);
  return {
    id,
    userId: 1,
    brand: input.brand,
    productLine: input.productLine ?? null,
    materialFamily: input.materialFamily,
    materialSubtype: input.materialSubtype ?? null,
    colorName: input.colorName ?? null,
    colorHex: input.colorHex,
    advertisedWeight: numberString(input.advertisedWeight),
    spoolType: input.spoolType ?? null,
    spoolMaterial: input.spoolMaterial ?? null,
    measurementMethod: input.measurementMethod,
    emptySpoolWeight: numberString(input.emptySpoolWeight),
    fullSpoolWeight: numberString(input.fullSpoolWeight),
    currentTotalWeight: numberString(input.currentTotalWeight),
    remainingGrams: numberString(remaining.remainingGrams ?? undefined),
    remainingPercent: numberString(remaining.remainingPercent ?? undefined),
    purchaseLink: input.purchaseLink ?? null,
    supplier: input.supplier ?? null,
    price: numberString(input.price),
    datePurchased: input.datePurchased ?? null,
    storageLocation: input.storageLocation ?? null,
    isDryBox: input.isDryBox ?? false,
    lastDriedAt: input.lastDriedAt ?? null,
    notes: input.notes ?? null,
    customLabels: input.customLabels ?? null,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function readDevFilaments() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DEV_FILAMENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FilamentRecord[];
    return parsed.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      datePurchased: item.datePurchased ? new Date(item.datePurchased) : null,
      lastDriedAt: item.lastDriedAt ? new Date(item.lastDriedAt) : null,
    }));
  } catch {
    window.localStorage.removeItem(DEV_FILAMENTS_KEY);
    return [];
  }
}

function writeDevFilaments(filaments: FilamentRecord[]) {
  window.localStorage.setItem(DEV_FILAMENTS_KEY, JSON.stringify(filaments));
}

function supabaseRestUrl(path: string) {
  return `${supabaseConfig.url}/rest/v1/${path}`;
}

async function requestSupabase<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(supabaseRestUrl(path), {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Supabase request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function getFilamentStats(filaments: FilamentRecord[]): FilamentStats {
  const active = filaments.filter((f) => !f.isArchived);
  const totalSpools = active.length;
  const totalGrams = active.reduce(
    (sum, f) => sum + (f.remainingGrams ? Number(f.remainingGrams) : 0),
    0
  );
  const lowStockCount = active.filter(
    (f) => f.remainingPercent !== null && Number(f.remainingPercent) <= 20
  ).length;
  const brandCounts: Record<string, number> = {};
  const materialCounts: Record<string, number> = {};

  for (const filament of active) {
    brandCounts[filament.brand] = (brandCounts[filament.brand] ?? 0) + 1;
    materialCounts[filament.materialFamily] =
      (materialCounts[filament.materialFamily] ?? 0) + 1;
  }

  const avgRemaining =
    totalSpools > 0
      ? Math.round(
          active.reduce(
            (sum, f) => sum + (f.remainingPercent ? Number(f.remainingPercent) : 0),
            0
          ) / totalSpools
        )
      : 0;

  return {
    totalSpools,
    totalGrams: Math.round(totalGrams),
    lowStockCount,
    brandDistribution: Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    materialDistribution: Object.entries(materialCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    avgRemaining,
  };
}

export function useFilaments() {
  const { session, isDevMode, initialized, isSupabaseConfigured } = useAuth();
  const [filaments, setFilaments] = useState<FilamentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFilaments = useCallback(async () => {
    if (!initialized) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isDevMode) {
        setFilaments(readDevFilaments());
        return;
      }

      if (!isSupabaseConfigured || !session?.access_token) {
        setFilaments([]);
        return;
      }

      const rows = await requestSupabase<SupabaseFilamentRow[]>(
        "filaments?select=*&is_archived=eq.false&order=updated_at.desc",
        session.access_token
      );
      setFilaments(rows.map(toFilament));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load filaments");
      setError(error);
      setFilaments([]);
    } finally {
      setIsLoading(false);
    }
  }, [initialized, isDevMode, isSupabaseConfigured, session?.access_token]);

  useEffect(() => {
    loadFilaments();
  }, [loadFilaments]);

  const createFilament = useCallback(
    async (input: FilamentInput) => {
      if (isDevMode) {
        const next = [makeDevFilament(input), ...readDevFilaments()];
        writeDevFilaments(next);
        setFilaments(next);
        return;
      }

      if (!session?.access_token) {
        throw new Error("Sign in before adding a spool.");
      }

      const rows = await requestSupabase<SupabaseFilamentRow[]>(
        "filaments?select=*",
        session.access_token,
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(toSupabasePayload(input, session.user.id)),
        }
      );
      setFilaments((current) => [toFilament(rows[0]), ...current]);
    },
    [isDevMode, session?.access_token]
  );

  const updateFilament = useCallback(
    async (id: number, input: FilamentInput) => {
      if (isDevMode) {
        const next = readDevFilaments().map((filament) =>
          filament.id === id
            ? { ...makeDevFilament(input, id), createdAt: filament.createdAt }
            : filament
        );
        writeDevFilaments(next);
        setFilaments(next);
        return;
      }

      if (!session?.access_token) {
        throw new Error("Sign in before editing a spool.");
      }

      const rows = await requestSupabase<SupabaseFilamentRow[]>(
        `filaments?id=eq.${id}&select=*`,
        session.access_token,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(toSupabasePayload(input, session.user.id)),
        }
      );
      const updated = toFilament(rows[0]);
      setFilaments((current) =>
        current.map((filament) => (filament.id === id ? updated : filament))
      );
    },
    [isDevMode, session?.access_token]
  );

  const deleteFilament = useCallback(
    async (id: number) => {
      if (isDevMode) {
        const next = readDevFilaments().filter((filament) => filament.id !== id);
        writeDevFilaments(next);
        setFilaments(next);
        return;
      }

      if (!session?.access_token) {
        throw new Error("Sign in before deleting a spool.");
      }

      await requestSupabase<void>(`filaments?id=eq.${id}`, session.access_token, {
        method: "DELETE",
      });
      setFilaments((current) => current.filter((filament) => filament.id !== id));
    },
    [isDevMode, session?.access_token]
  );

  const stats = useMemo(() => getFilamentStats(filaments), [filaments]);

  return {
    filaments,
    stats,
    isLoading,
    error,
    reload: loadFilaments,
    createFilament,
    updateFilament,
    deleteFilament,
  };
}
