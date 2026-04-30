import { Boxes, CheckCircle2, Layers, Palette, Printer, Scale, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ONBOARDING_VERSION = "1.0.0";

export type TutorialStep = {
  id: string;
  versionIntroduced: string;
  title: string;
  description: string;
  targetSelector?: string;
  route?: string;
  visualType: "welcome" | "spool" | "scale" | "details" | "collections" | "prints" | "settings" | "ready";
  icon: LucideIcon;
};

export const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    versionIntroduced: "1.0.0",
    title: "Welcome to PLA Pantry",
    description:
      "Track filament inventory, remaining spool weight, print history, and material decisions in one clean workspace.",
    route: "/filaments",
    visualType: "welcome",
    icon: Sparkles,
  },
  {
    id: "add-spool",
    versionIntroduced: "1.0.0",
    title: "Add your first spool",
    description:
      "Use Add Spool for new or used rolls. Capture brand, material, color, weights, notes, purchase links, and print settings.",
    route: "/filaments",
    targetSelector: "[data-onboarding='add-spool']",
    visualType: "spool",
    icon: Layers,
  },
  {
    id: "remaining",
    versionIntroduced: "1.0.0",
    title: "Track remaining filament",
    description:
      "Weigh current spools, recalibrate after missed prints, and let PLA Pantry calculate remaining grams and percentage.",
    route: "/filaments",
    visualType: "scale",
    icon: Scale,
  },
  {
    id: "details",
    versionIntroduced: "1.0.0",
    title: "View filament details",
    description:
      "Click a filament card to open the detail drawer with print settings, notes, purchase info, and spool visualization.",
    route: "/filaments",
    targetSelector: "[data-onboarding='filament-grid']",
    visualType: "details",
    icon: Palette,
  },
  {
    id: "collections",
    versionIntroduced: "1.0.0",
    title: "Collections",
    description:
      "Group your spools by brand, material, storage location, or color family to spot inventory patterns quickly.",
    route: "/collections",
    targetSelector: "[href='/collections']",
    visualType: "collections",
    icon: Boxes,
  },
  {
    id: "prints",
    versionIntroduced: "1.0.0",
    title: "Prints",
    description:
      "Log one-time prints, save quick-print templates, reprint common jobs, and automatically subtract filament used.",
    route: "/prints",
    targetSelector: "[href='/prints']",
    visualType: "prints",
    icon: Printer,
  },
  {
    id: "settings",
    versionIntroduced: "1.0.0",
    title: "Settings and preferences",
    description:
      "Control theme, review account info, sign out, and replay this tutorial whenever you want a refresher.",
    route: "/settings",
    targetSelector: "[href='/settings']",
    visualType: "settings",
    icon: Settings,
  },
  {
    id: "ready",
    versionIntroduced: "1.0.0",
    title: "You're ready",
    description: "Add your first spool and start building a cleaner filament workflow.",
    route: "/filaments",
    targetSelector: "[data-onboarding='add-spool']",
    visualType: "ready",
    icon: CheckCircle2,
  },
];
