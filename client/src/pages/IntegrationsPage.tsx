import ComingSoonPage from "@/components/ComingSoonPage";
import { Cpu } from "lucide-react";
export default function IntegrationsPage() {
  return (
    <ComingSoonPage
      icon={Cpu}
      title="Integrations"
      description="Connect PLA Pantry to your printers, slicers, scales, and more."
      features={[
        "Bambu Lab AMS integration",
        "Prusa Connect and PrusaSlicer sync",
        "Bluetooth scale for live weight reading",
        "Barcode and QR code scanning",
        "OrcaSlicer and Cura plugin support",
        "REST API for custom integrations",
      ]}
      accentColor="oklch(0.68 0.18 310)"
    />
  );
}
