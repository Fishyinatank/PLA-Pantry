import { useAuth } from "@/_core/hooks/useAuth";
import { Code2, Database, DoorOpen, KeyRound, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

const DEV_NAV = [
  { href: "/dev/filament-details", label: "Filament Details", icon: Database },
  { href: "/dev/access", label: "Dev Access", icon: KeyRound },
];

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [location, navigate] = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r md:flex" style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/PLA-Pantry-Logo.png" alt="PLA Pantry" className="h-9 w-9 rounded-lg object-contain" />
          <div>
            <p className="font-bold" style={{ color: "var(--gold)", fontFamily: "'Space Grotesk', sans-serif" }}>PLA Pantry</p>
            <p className="text-xs text-muted-foreground">Developer Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {DEV_NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition"
                  style={{
                    background: active ? "oklch(0.78 0.16 85 / 0.14)" : "transparent",
                    color: active ? "var(--gold)" : "var(--sidebar-foreground)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t p-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "var(--sidebar-accent)" }}>
            <p className="font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-muted-foreground">Dev access verified</p>
          </div>
          <button onClick={() => navigate("/filaments")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <DoorOpen className="h-4 w-4" />
            Exit dev
          </button>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b px-4 py-4 md:px-8" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div className="flex items-center gap-3">
            <Code2 className="h-5 w-5" style={{ color: "var(--gold)" }} />
            <div>
              <h1 className="text-lg font-semibold">Developer Console</h1>
              <p className="text-xs text-muted-foreground">Internal reference data and access control</p>
            </div>
          </div>
          <button onClick={() => navigate("/filaments")} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            Exit
          </button>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
