import { useAuth } from "@/contexts/AuthContext";
import { supabaseConfig, type SupabaseSession } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

const DEV_PRINT_LOGS_KEY = "pla-pantry-dev-print-logs";
const DEV_PRINT_TEMPLATES_KEY = "pla-pantry-dev-print-templates";

export type PrintLog = {
  id: number;
  name: string;
  description: string | null;
  filamentId: number | null;
  filamentLabel: string | null;
  gramsUsed: number;
  filamentBeforeGrams: number | null;
  filamentAfterGrams: number | null;
  mode: "one_time" | "new" | "reprint";
  printedAt: Date | string | null | undefined;
};

export type QuickPrintTemplate = {
  id: number;
  name: string;
  description: string | null;
  estimatedGrams: number;
  estimatedCost: string | null;
  createdAt: Date;
};

type PrintLogRow = {
  id: number;
  print_name: string;
  description: string | null;
  filament_id: number | null;
  filament_label: string | null;
  grams_used: string;
  filament_before_grams: string | null;
  filament_after_grams: string | null;
  mode: "one_time" | "new" | "reprint";
  printed_at: string | null;
};

type TemplateRow = {
  id: number;
  name: string;
  description: string | null;
  estimated_grams: string;
  estimated_cost: string | null;
  created_at: string;
};

function restUrl(path: string) {
  return `${supabaseConfig.url}/rest/v1/${path}`;
}

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit,
  refresh?: () => Promise<SupabaseSession | null>,
  retried = false
) {
  const response = await fetch(restUrl(path), {
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
      const next = await refresh();
      if (!next?.access_token) throw new Error("Your session expired. Please sign in again.");
      return request<T>(path, next.access_token, init, refresh, true);
    }
    throw new Error(body || `Supabase request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function readDev<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

function writeDev<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

const toLog = (row: PrintLogRow): PrintLog => ({
  id: row.id,
  name: row.print_name,
  description: row.description,
  filamentId: row.filament_id,
  filamentLabel: row.filament_label,
  gramsUsed: Number(row.grams_used),
  filamentBeforeGrams: row.filament_before_grams === null ? null : Number(row.filament_before_grams),
  filamentAfterGrams: row.filament_after_grams === null ? null : Number(row.filament_after_grams),
  mode: row.mode,
  printedAt: row.printed_at ? new Date(row.printed_at) : null,
});

const toTemplate = (row: TemplateRow): QuickPrintTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description,
  estimatedGrams: Number(row.estimated_grams),
  estimatedCost: row.estimated_cost,
  createdAt: new Date(row.created_at),
});

export function usePrintStore() {
  const { session, isDevMode, initialized, refreshSession } = useAuth();
  const [logs, setLogs] = useState<PrintLog[]>([]);
  const [templates, setTemplates] = useState<QuickPrintTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!initialized) return;
    setIsLoading(true);
    try {
      if (isDevMode) {
        setLogs(readDev<PrintLog>(DEV_PRINT_LOGS_KEY));
        setTemplates(readDev<QuickPrintTemplate>(DEV_PRINT_TEMPLATES_KEY).map((t) => ({ ...t, createdAt: new Date(t.createdAt) })));
        return;
      }
      if (!session?.access_token) return;
      const [logRows, templateRows] = await Promise.all([
        request<PrintLogRow[]>("print_logs?select=*&order=printed_at.desc", session.access_token, undefined, refreshSession),
        request<TemplateRow[]>("quick_print_templates?select=*&order=created_at.desc", session.access_token, undefined, refreshSession),
      ]);
      setLogs(logRows.map(toLog));
      setTemplates(templateRows.map(toTemplate));
    } finally {
      setIsLoading(false);
    }
  }, [initialized, isDevMode, refreshSession, session?.access_token]);

  useEffect(() => { load(); }, [load]);

  const addTemplate = useCallback(async (input: Omit<QuickPrintTemplate, "id" | "createdAt">) => {
    if (isDevMode) {
      const next = [{ ...input, id: Date.now(), createdAt: new Date() }, ...readDev<QuickPrintTemplate>(DEV_PRINT_TEMPLATES_KEY)];
      writeDev(DEV_PRINT_TEMPLATES_KEY, next);
      setTemplates(next);
      return next[0];
    }
    if (!session?.access_token) throw new Error("Sign in first.");
    const rows = await request<TemplateRow[]>("quick_print_templates?select=*", session.access_token, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: session.user.id,
        name: input.name,
        description: input.description,
        estimated_grams: input.estimatedGrams,
        estimated_cost: input.estimatedCost,
      }),
    }, refreshSession);
    const next = toTemplate(rows[0]);
    setTemplates((old) => [next, ...old]);
    return next;
  }, [isDevMode, refreshSession, session?.access_token, session?.user.id]);

  const addLog = useCallback(async (input: Omit<PrintLog, "id" | "printedAt">) => {
    if (isDevMode) {
      const next = [{ ...input, id: Date.now(), printedAt: new Date() }, ...readDev<PrintLog>(DEV_PRINT_LOGS_KEY)];
      writeDev(DEV_PRINT_LOGS_KEY, next);
      setLogs(next);
      return;
    }
    if (!session?.access_token) throw new Error("Sign in first.");
    const rows = await request<PrintLogRow[]>("print_logs?select=*", session.access_token, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: session.user.id,
        print_name: input.name,
        description: input.description,
        filament_id: input.filamentId,
        filament_label: input.filamentLabel,
        grams_used: input.gramsUsed,
        filament_before_grams: input.filamentBeforeGrams,
        filament_after_grams: input.filamentAfterGrams,
        mode: input.mode,
      }),
    }, refreshSession);
    setLogs((old) => [toLog(rows[0]), ...old]);
  }, [isDevMode, refreshSession, session?.access_token, session?.user.id]);

  const deleteLog = useCallback(async (id: number) => {
    if (isDevMode) {
      const next = readDev<PrintLog>(DEV_PRINT_LOGS_KEY).filter((log) => log.id !== id);
      writeDev(DEV_PRINT_LOGS_KEY, next);
      setLogs(next);
      return;
    }
    if (!session?.access_token) throw new Error("Sign in first.");
    await request<void>(`print_logs?id=eq.${id}`, session.access_token, { method: "DELETE" }, refreshSession);
    setLogs((old) => old.filter((log) => log.id !== id));
  }, [isDevMode, refreshSession, session?.access_token]);

  const clearLogs = useCallback(async () => {
    if (isDevMode) {
      writeDev(DEV_PRINT_LOGS_KEY, []);
      setLogs([]);
      return;
    }
    if (!session?.access_token) throw new Error("Sign in first.");
    await request<void>("print_logs?id=gt.0", session.access_token, { method: "DELETE" }, refreshSession);
    setLogs([]);
  }, [isDevMode, refreshSession, session?.access_token]);

  return { logs, templates, isLoading, addLog, addTemplate, deleteLog, clearLogs, reload: load };
}
