import { useAuth } from "@/_core/hooks/useAuth";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { hasDevToken } from "@/lib/devToken";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Info,
  FolderOpen,
  Layers,
  LogOut,
  Menu,
  Printer,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/filaments", label: "Filaments", icon: Layers },
  { href: "/prints", label: "Prints", icon: Printer },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/integrations", label: "Integrations", icon: Cpu },
  { href: "/about", label: "About", icon: Info },
  { href: "/settings", label: "Settings", icon: Settings },
];

type FooterModal = "privacy" | "terms" | "contact" | null;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, signOut, isDevMode } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [footerModal, setFooterModal] = useState<FooterModal>(null);

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
  const showDevToken = hasDevToken(user?.email);

  const SidebarInner = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        <Link href="/filaments" onClick={onNav}>
          <img src="/PLA-Pantry-Logo.png" alt="PLA Pantry" className="w-8 h-8 rounded-lg object-contain shrink-0" />
        </Link>
        {!collapsed && (
          <Link href="/filaments" onClick={onNav} className="text-base font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold)" }}>
            PLA Pantry
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-[1_1_auto] px-2 py-4 overflow-y-auto">
        <div className="flex min-h-[min(620px,75vh)] flex-col justify-between gap-2">
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
        </div>
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
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: "var(--auth-dev-text)" }}>
                    Dev Mode
                  </span>
                )}
                {showDevToken && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: "var(--gold)" }} title="Dev token">
                    <BadgeCheck className="h-3 w-3" />
                    Dev
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
          <Link href="/filaments" className="flex items-center gap-2 font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--gold)" }}>
            <img src="/PLA-Pantry-Logo.png" alt="" className="w-6 h-6 rounded-md object-contain" />
            PLA Pantry
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <OnboardingProvider>
            <div key={location} className="page-transition min-h-full flex flex-col">
              {children}
              <footer className="mt-auto border-t px-4 py-4 text-xs text-muted-foreground sm:px-6" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>© 2026 PLA Pantry. All rights reserved.</span>
                  <div className="flex gap-4">
                    <button className="hover:text-foreground" onClick={() => setFooterModal("privacy")}>Privacy</button>
                    <button className="hover:text-foreground" onClick={() => setFooterModal("terms")}>Terms</button>
                    <button className="hover:text-foreground" onClick={() => setFooterModal("contact")}>Contact</button>
                  </div>
                </div>
              </footer>
            </div>
            <OnboardingTutorial />
          </OnboardingProvider>
        </main>
      </div>
      {footerModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setFooterModal(null)} />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border p-6 shadow-2xl animate-scale-in" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {footerModal === "privacy" ? "Privacy" : footerModal === "terms" ? "Terms" : "Contact"}
              </h2>
              <button onClick={() => setFooterModal(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>
            {footerModal === "privacy" && (
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>PLA Pantry stores account data needed to sign you in and identify your workspace.</p>
                <p>Your filament inventory, print logs, quick-print templates, and related settings are stored so the app can sync your maker workflow across devices.</p>
                <p>Authentication is handled through Supabase. PLA Pantry does not sell personal data. Access to inventory data is limited by account-based security rules.</p>
                <p>This placeholder policy will be replaced with a full legal policy before broad public launch.</p>
              </div>
            )}
            {footerModal === "terms" && (
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>PLA Pantry is provided as an inventory and workflow tool for 3D printing materials and print records.</p>
                <p>The app is provided without warranty. Users are responsible for checking material condition, print settings, printer safety, and final print outcomes.</p>
                <p>Users are responsible for their account activity and for keeping their data accurate. Do not upload unlawful, harmful, or misleading content.</p>
                <p>These placeholder terms will be replaced with full legal terms before broad public launch.</p>
              </div>
            )}
            {footerModal === "contact" && (
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            )}
            <button onClick={() => setFooterModal(null)} className="mt-6 w-full rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "oklch(0.10 0.005 240)" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
