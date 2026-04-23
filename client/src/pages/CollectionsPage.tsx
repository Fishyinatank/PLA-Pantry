import ComingSoonPage from "@/components/ComingSoonPage";
import { FolderOpen } from "lucide-react";
export default function CollectionsPage() {
  return (
    <ComingSoonPage
      icon={FolderOpen}
      title="Collections"
      description="Organize your spools into smart groups and saved collections for quick access."
      features={[
        "Create custom collections (e.g. Matte PLA, Dry Box)",
        "Smart collections based on material or brand",
        "AMS-ready and low-stock auto-collections",
        "Share collections across devices",
        "Drag-and-drop spool organization",
      ]}
      accentColor="oklch(0.65 0.18 200)"
    />
  );
}
