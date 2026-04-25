import { useAuth } from "@/contexts/AuthContext";
import { supabaseConfig, type SupabaseSession } from "@/lib/supabase";
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
  maxVolumetricFlow: string | null;
  pressureAdvance: string | null;
  nozzleTempMin: number | null;
  nozzleTempMax: number | null;
  bedTemp: number | null;
  chamberTemp: number | null;
  coolingFanPercent: number | null;
  recommendedSpeed: number | null;
  dryingTemp: number | null;
  dryingTime: string | null;
  slicerNotes: string | null;
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
  maxVolumetricFlow?: number;
  pressureAdvance?: number;
  nozzleTempMin?: number;
  nozzleTempMax?: number;
  bedTemp?: number;
  chamberTemp?: number;
  coolingFanPercent?: number;
  recommendedSpeed?: number;
  dryingTemp?: number;
  dryingTime?: string;
  slicerNotes?: string;
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
  max_volumetric_flow: string | null;
  pressure_advance: string | null;
  nozzle_temp_min: number | null;
  nozzle_temp_max: number | null;
  bed_temp: number | null;
  chamber_temp: number | null;
  cooling_fan_percent: number | null;
  recommended_speed: number | null;
  drying_temp: number | null;
  drying_time: string | null;
  slicer_notes: string | null;
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

function capRemaining(remaining: number, advertised?: number | null) {
  const safe = Math.max(0, Number.isFinite(remaining) ? remaining : 0);
  if (!advertised || advertised <= 0) return Math.round(safe);
  return Math.round(Math.min(safe, advertised));
}

function calcPercent(remaining: number | null, advertised?: number | null) {
  if (remaining === null || !advertised || advertised <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((remaining / advertised) * 100)));
}

function calculateRemaining(data: Partial<FilamentInput>) {
  const advertised = data.advertisedWeight ?? null;
  const current = data.currentTotalWeight ?? null;

  if (current === null || current === undefined) {
    return { remainingGrams: null, remainingPercent: null };
  }

  if (data.measurementMethod === "empty_spool" && data.emptySpoolWeight != null) {
    const remaining = capRemaining(current - data.emptySpoolWeight, advertised);
    return { remainingGrams: remaining, remainingPercent: calcPercent(remaining, advertised) };
  }

  if (
    data.measurementMethod === "full_spool" &&
    data.fullSpoolWeight != null &&
    advertised
  ) {
    const emptySpool = data.fullSpoolWeight - advertised;
    const remaining = capRemaining(current - emptySpool, advertised);
    return { remainingGrams: remaining, remainingPercent: calcPercent(remaining, advertised) };
  }

  return { remainingGrams: null, remainingPercent: null };
}

function normalizeRemaining<T extends { advertisedWeight: string | null; remainingGrams: string | null; remainingPercent: string | null }>(filament: T): T {
  if (filament.remainingGrams === null) return filament;
  const advertised = filament.advertisedWeight ? Number(filament.advertisedWeight) : null;
  const remaining = capRemaining(Number(filament.remainingGrams), advertised);
  return {
    ...filament,
    remainingGrams: String(remaining),
    remainingPercent: numberString(calcPercent(remaining, advertised) ?? undefined),
  };
}

function toFilament(row: SupabaseFilamentRow): FilamentRecord {
  return normalizeRemaining({
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
    maxVolumetricFlow: row.max_volumetric_flow,
    pressureAdvance: row.pressure_advance,
    nozzleTempMin: row.nozzle_temp_min,
    nozzleTempMax: row.nozzle_temp_max,
    bedTemp: row.bed_temp,
    chamberTemp: row.chamber_temp,
    coolingFanPercent: row.cooling_fan_percent,
    recommendedSpeed: row.recommended_speed,
    dryingTemp: row.drying_temp,
    dryingTime: row.drying_time,
    slicerNotes: row.slicer_notes,
    isArchived: row.is_archived,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
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
    max_volumetric_flow: numberString(input.maxVolumetricFlow),
    pressure_advance: numberString(input.pressureAdvance),
    nozzle_temp_min: input.nozzleTempMin ?? null,
    nozzle_temp_max: input.nozzleTempMax ?? null,
    bed_temp: input.bedTemp ?? null,
    chamber_temp: input.chamberTemp ?? null,
    cooling_fan_percent: input.coolingFanPercent ?? null,
    recommended_speed: input.recommendedSpeed ?? null,
    drying_temp: input.dryingTemp ?? null,
    drying_time: input.dryingTime ?? null,
    slicer_notes: input.slicerNotes ?? null,
  };
}

function makeDevFilament(input: FilamentInput, id = Date.now()): FilamentRecord {
  const now = new Date();
  const remaining = calculateRemaining(input);
  return normalizeRemaining({
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
    maxVolumetricFlow: numberString(input.maxVolumetricFlow),
    pressureAdvance: numberString(input.pressureAdvance),
    nozzleTempMin: input.nozzleTempMin ?? null,
    nozzleTempMax: input.nozzleTempMax ?? null,
    bedTemp: input.bedTemp ?? null,
    chamberTemp: input.chamberTemp ?? null,
    coolingFanPercent: input.coolingFanPercent ?? null,
    recommendedSpeed: input.recommendedSpeed ?? null,
    dryingTemp: input.dryingTemp ?? null,
    dryingTime: input.dryingTime ?? null,
    slicerNotes: input.slicerNotes ?? null,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  });
}

function readDevFilaments() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DEV_FILAMENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as FilamentRecord[];
    return parsed.map((item) => normalizeRemaining({
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
  init?: RequestInit,
  refresh?: () => Promise<SupabaseSession | null>,
  retried = false
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
    const expired =
      response.status === 401 ||
      body.includes("PGRST303") ||
      body.toLowerCase().includes("jwt expired");
    if (expired && refresh && !retried) {
      const nextSession = await refresh();
      if (!nextSession?.access_token) throw new Error("Your session expired. Please sign in again.");
      return requestSupabase<T>(path, nextSession.access_token, init, refresh, true);
    }
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
  const { session, isDevMode, initialized, isSupabaseConfigured, refreshSession } = useAuth();
  const [filaments, setFilaments] = useState<FilamentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFilaments = useCallback(async () => {
    if (!initialized) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isDevMode) {
        const normalized = readDevFilaments();
        writeDevFilaments(normalized);
        setFilaments(normalized);
        return;
      }

      if (!isSupabaseConfigured || !session?.access_token) {
        setFilaments([]);
        return;
      }

      const rows = await requestSupabase<SupabaseFilamentRow[]>(
        "filaments?select=*&is_archived=eq.false&order=updated_at.desc",
        session.access_token,
        undefined,
        refreshSession
      );
      const normalized = rows.map(toFilament);
      setFilaments(normalized);
      const repairs = normalized.filter((filament, index) =>
        rows[index].remaining_grams !== filament.remainingGrams ||
        rows[index].remaining_percent !== filament.remainingPercent
      );
      if (repairs.length > 0) {
        void Promise.all(repairs.map((filament) =>
          requestSupabase<void>(
            `filaments?id=eq.${filament.id}`,
            session.access_token,
            {
              method: "PATCH",
              body: JSON.stringify({
                remaining_grams: filament.remainingGrams,
                remaining_percent: filament.remainingPercent,
              }),
            },
            refreshSession
          ).catch(() => undefined)
        ));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load filaments");
      setError(error);
      setFilaments([]);
    } finally {
      setIsLoading(false);
    }
  }, [initialized, isDevMode, isSupabaseConfigured, refreshSession, session?.access_token]);

  useEffect(() => {
    loadFilaments();
  }, [loadFilaments]);

  const createFilament = useCallback(
    async (input: FilamentInput) => {
      if (isDevMode) {
        const current = readDevFilaments();
        const nextId = Math.max(0, ...current.map((filament) => filament.id)) + 1;
        const next = [makeDevFilament(input, nextId), ...current];
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
        },
        refreshSession
      );
      setFilaments((current) => [toFilament(rows[0]), ...current]);
    },
    [isDevMode, refreshSession, session?.access_token, session?.user.id]
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
        },
        refreshSession
      );
      const updated = toFilament(rows[0]);
      setFilaments((current) =>
        current.map((filament) => (filament.id === id ? updated : filament))
      );
    },
    [isDevMode, refreshSession, session?.access_token, session?.user.id]
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

      await requestSupabase<void>(
        `filaments?id=eq.${id}`,
        session.access_token,
        { method: "DELETE" },
        refreshSession
      );
      setFilaments((current) => current.filter((filament) => filament.id !== id));
    },
    [isDevMode, refreshSession, session?.access_token]
  );

  const recalibrateFilament = useCallback(
    async (id: number, currentTotalWeight: number) => {
      const target = filaments.find((f) => f.id === id);
      if (!target) throw new Error("Spool not found.");
      const input: FilamentInput = {
        brand: target.brand,
        productLine: target.productLine ?? undefined,
        materialFamily: target.materialFamily,
        materialSubtype: target.materialSubtype ?? undefined,
        colorName: target.colorName ?? undefined,
        colorHex: target.colorHex,
        advertisedWeight: target.advertisedWeight ? Number(target.advertisedWeight) : undefined,
        spoolType: target.spoolType ?? undefined,
        spoolMaterial: target.spoolMaterial ?? undefined,
        measurementMethod: target.measurementMethod,
        emptySpoolWeight: target.emptySpoolWeight ? Number(target.emptySpoolWeight) : undefined,
        fullSpoolWeight: target.fullSpoolWeight ? Number(target.fullSpoolWeight) : undefined,
        currentTotalWeight,
        purchaseLink: target.purchaseLink ?? undefined,
        supplier: target.supplier ?? undefined,
        storageLocation: target.storageLocation ?? undefined,
        isDryBox: target.isDryBox ?? false,
        notes: target.notes ?? undefined,
        customLabels: target.customLabels ?? undefined,
        maxVolumetricFlow: target.maxVolumetricFlow ? Number(target.maxVolumetricFlow) : undefined,
        pressureAdvance: target.pressureAdvance ? Number(target.pressureAdvance) : undefined,
        nozzleTempMin: target.nozzleTempMin ?? undefined,
        nozzleTempMax: target.nozzleTempMax ?? undefined,
        bedTemp: target.bedTemp ?? undefined,
        chamberTemp: target.chamberTemp ?? undefined,
        coolingFanPercent: target.coolingFanPercent ?? undefined,
        recommendedSpeed: target.recommendedSpeed ?? undefined,
        dryingTemp: target.dryingTemp ?? undefined,
        dryingTime: target.dryingTime ?? undefined,
        slicerNotes: target.slicerNotes ?? undefined,
      };
      await updateFilament(id, input);
    },
    [filaments, updateFilament]
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
    recalibrateFilament,
  };
}
