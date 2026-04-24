import { useFilaments } from "@/lib/filamentStore";
import { AlertTriangle, BarChart3, Package, Percent, Weight } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "oklch(0.78 0.16 85)",
  "oklch(0.65 0.18 200)",
  "oklch(0.70 0.18 145)",
  "oklch(0.68 0.18 310)",
  "oklch(0.72 0.18 30)",
  "oklch(0.65 0.16 260)",
  "oklch(0.70 0.15 170)",
  "oklch(0.68 0.18 350)",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg shadow-lg text-sm" style={{ background: "var(--popover)", border: "1px solid var(--border)" }}>
      {label && <p className="text-muted-foreground text-xs mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color || "var(--foreground)" }}>
          {p.name ? `${p.name}: ` : ""}{p.value}
        </p>
      ))}
    </div>
  );
};

export default function StatsPage() {
  const { stats, isLoading } = useFilaments();

  const statCards = [
    {
      icon: Package,
      label: "Total Spools",
      value: stats?.totalSpools ?? 0,
      unit: "spools",
      color: "oklch(0.78 0.16 85)",
      bg: "oklch(0.78 0.16 85 / 0.10)",
    },
    {
      icon: Weight,
      label: "Total Filament",
      value: stats?.totalGrams ? (stats.totalGrams >= 1000 ? `${(stats.totalGrams / 1000).toFixed(2)} kg` : `${stats.totalGrams} g`) : "0 g",
      unit: "",
      color: "oklch(0.65 0.18 200)",
      bg: "oklch(0.65 0.18 200 / 0.10)",
    },
    {
      icon: AlertTriangle,
      label: "Low Stock",
      value: stats?.lowStockCount ?? 0,
      unit: "spools ≤20%",
      color: "oklch(0.65 0.20 25)",
      bg: "oklch(0.65 0.20 25 / 0.10)",
    },
    {
      icon: Percent,
      label: "Avg Remaining",
      value: `${stats?.avgRemaining ?? 0}%`,
      unit: "across all spools",
      color: "oklch(0.70 0.18 145)",
      bg: "oklch(0.70 0.18 145 / 0.10)",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-xl font-bold text-foreground">Stats</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Inventory analytics and insights</p>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, label, value, unit, color, bg }) => (
            <div
              key={label}
              className="rounded-xl p-4 border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              {isLoading ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg skeleton" />
                  <div className="h-7 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}>
                    <Icon className="w-4.5 h-4.5" style={{ color }} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand distribution */}
          <div className="rounded-xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: "var(--gold)" }} />
              <h3 className="text-sm font-semibold text-foreground">Brand Distribution</h3>
            </div>
            {isLoading ? (
              <div className="h-48 skeleton rounded-lg" />
            ) : !stats?.brandDistribution?.length ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.brandDistribution.slice(0, 8)} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "oklch(0.55 0.008 240)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fill: "oklch(0.55 0.008 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.22 0.008 240 / 0.5)" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.brandDistribution.slice(0, 8).map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Material distribution */}
          <div className="rounded-xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4" style={{ color: "oklch(0.65 0.18 200)" }} />
              <h3 className="text-sm font-semibold text-foreground">Material Distribution</h3>
            </div>
            {isLoading ? (
              <div className="h-48 skeleton rounded-lg" />
            ) : !stats?.materialDistribution?.length ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.materialDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {stats.materialDistribution.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {stats.materialDistribution.map((m: any, i: number) => (
                    <div key={m.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-foreground truncate">{m.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground shrink-0">{m.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Low stock list */}
        {(stats?.lowStockCount ?? 0) > 0 && (
          <div className="rounded-xl p-5 border" style={{ background: "oklch(0.55 0.20 25 / 0.06)", borderColor: "oklch(0.55 0.20 25 / 0.25)" }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">{stats?.lowStockCount} spool{stats?.lowStockCount !== 1 ? "s" : ""} running low</h3>
            </div>
            <p className="text-xs text-muted-foreground">Check your Filaments page and consider reordering soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
