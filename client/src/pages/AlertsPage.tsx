import ComingSoonPage from "@/components/ComingSoonPage";
import { AlertTriangle } from "lucide-react";
export default function AlertsPage() {
  return (
    <ComingSoonPage
      icon={AlertTriangle}
      title="Alerts"
      description="Stay ahead of low stock, expired filament, and drying reminders."
      features={[
        "Low-stock alerts with configurable thresholds",
        "Reorder reminders with purchase links",
        "Stale entry detection for old spools",
        "Drying and storage reminders",
        "Push notifications and email digests",
      ]}
      accentColor="oklch(0.65 0.20 25)"
    />
  );
}
