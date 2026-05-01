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
    description: "Track spools, remaining weight, prints, and material choices in one place.",
    route: "/filaments",
    visualType: "welcome",
    icon: Sparkles,
  },
  {
    id: "add-spool",
    versionIntroduced: "1.0.0",
    title: "Add your first spool",
    description: "Add new or used rolls with brand, material, color, weight, notes, links, and print settings.",
    route: "/filaments",
    targetSelector: "[data-onboarding='add-spool']",
    visualType: "spool",
    icon: Layers,
  },
  {
    id: "remaining",
    versionIntroduced: "1.0.0",
    title: "Track remaining filament",
    description: "Weigh and recalibrate spools. PLA Pantry keeps grams and percent updated.",
    route: "/filaments",
    visualType: "scale",
    icon: Scale,
  },
  {
    id: "details",
    versionIntroduced: "1.0.0",
    title: "View filament details",
    description: "Click any spool for settings, notes, purchase info, and the spool visual.",
    route: "/filaments",
    targetSelector: "[data-onboarding='filament-grid']",
    visualType: "details",
    icon: Palette,
  },
  {
    id: "collections",
    versionIntroduced: "1.0.0",
    title: "Collections",
    description: "Group spools by brand, material, storage location, or color family.",
    route: "/collections",
    targetSelector: "[href='/collections']",
    visualType: "collections",
    icon: Boxes,
  },
  {
    id: "prints",
    versionIntroduced: "1.0.0",
    title: "Prints",
    description: "Log prints, save quick-print templates, reprint jobs, and subtract filament automatically.",
    route: "/prints",
    targetSelector: "[href='/prints']",
    visualType: "prints",
    icon: Printer,
  },
  {
    id: "settings",
    versionIntroduced: "1.0.0",
    title: "Settings and preferences",
    description: "Control theme, review your account, sign out, or replay this tutorial.",
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
