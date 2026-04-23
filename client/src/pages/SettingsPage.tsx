import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Download, LogOut, Moon, Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: stats } = trpc.filaments.stats.useQuery();

  const handleExport = () => {
    toast.info("Data export coming soon!");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 max-w-2xl">
        {/* Profile */}
        <div className="rounded-xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4" style={{ color: "var(--gold)" }} />
            <h3 className="text-sm font-semibold text-foreground">Profile</h3>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
              style={{ background: "oklch(0.78 0.16 85 / 0.15)", color: "var(--gold)", border: "2px solid oklch(0.78 0.16 85 / 0.30)" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.name ?? "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? "No email"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats?.totalSpools ?? 0} spool{stats?.totalSpools !== 1 ? "s" : ""} in inventory
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4" style={{ color: "oklch(0.65 0.18 200)" }} />
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">PLA Pantry is dark-mode first</p>
            </div>
            <div
              className="w-10 h-5 rounded-full flex items-center px-0.5"
              style={{ background: "var(--gold)" }}
            >
              <div className="w-4 h-4 rounded-full bg-white ml-auto" />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="rounded-xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4" style={{ color: "oklch(0.70 0.18 145)" }} />
            <h3 className="text-sm font-semibold text-foreground">Data</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Export Inventory</p>
                <p className="text-xs text-muted-foreground">Download your filament data as CSV or JSON</p>
              </div>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" }}
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: "oklch(0.68 0.18 310)" }} />
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of PLA Pantry on this device</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ background: "oklch(0.55 0.20 25 / 0.15)", color: "oklch(0.65 0.20 25)", border: "1px solid oklch(0.55 0.20 25 / 0.30)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          PLA Pantry · Your inventory is private and synced across devices
        </p>
      </div>
    </div>
  );
}
