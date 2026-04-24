import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FolderOpen,
  Layers,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/filaments", label: "Filaments", icon: Layers },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/integrations", label: "Integrations", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, signOut, isDevMode } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-2 animate-spin"
            style={{ borderColor: "oklch(0.78 0.16 85 / 0.3)", borderTopColor: "var(--gold)" }}
          />
          <p className="text-muted-foreground text-sm">Loading PLA Pantry…</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/filaments" && (location === "/" || location === "/filaments")) return true;
    return location === href;
  };

  const SidebarInner = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "oklch(0.78 0.16 85 / 0.15)", border: "1px solid oklch(0.78 0.16 85 / 0.30)" }}
        >
          <Package className="w-4 h-4" style={{ color: "var(--gold)" }} />
        </div>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold)" }}>
            PLA Pantry
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onNav}>
            <div
              className={`nav-item ${isActive(href) ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="px-2 pb-4 pt-2 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        {!collapsed && (
          <div
            className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg"
            style={{ background: "var(--sidebar-accent)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "oklch(0.78 0.16 85 / 0.20)", color: "var(--gold)" }}
            >
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-foreground">{user?.name ?? "User"}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs truncate text-muted-foreground">{user?.email ?? ""}</p>
                {isDevMode && (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-100">
                    Dev Mode
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className={`nav-item w-full hover:text-destructive ${collapsed ? "justify-center px-2" : ""}`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 transition-all duration-200 relative"
        style={{
          width: collapsed ? "60px" : "220px",
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <SidebarInner />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col animate-slide-right"
            style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarInner onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold)" }}>
            PLA Pantry
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
