import { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  accentColor?: string;
}

export default function ComingSoonPage({
  icon: Icon,
  title,
  description,
  features,
  accentColor = "var(--gold)",
}: ComingSoonPageProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: `${accentColor.replace("var(--gold)", "oklch(0.78 0.16 85)")} / 0.10`.includes("oklch")
                ? "oklch(0.78 0.16 85 / 0.10)"
                : `${accentColor}1a`,
              border: `1px solid ${accentColor === "var(--gold)" ? "oklch(0.78 0.16 85 / 0.25)" : accentColor + "40"}`,
            }}
          >
            <Icon className="w-9 h-9" style={{ color: accentColor }} />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </div>

          {/* Planned features */}
          <div
            className="rounded-xl p-4 text-left space-y-2"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Planned Features</p>
            {features.map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accentColor }} />
                <span className="text-sm text-foreground">{f}</span>
              </div>
            ))}
          </div>

          {/* Coming soon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
