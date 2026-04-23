// ─── Brand Catalog ────────────────────────────────────────────────────────────
export const BRANDS = [
  "Bambu Lab", "Prusa", "eSUN", "Hatchbox", "Polymaker", "Overture",
  "SUNLU", "Creality", "ERYONE", "Inland", "AMOLEN", "Duramic",
  "Elegoo", "Anycubic", "Flashforge", "MatterHackers", "ColorFabb",
  "Fillamentum", "Proto-pasta", "Atomic Filament", "3DXTech", "Taulman",
  "Prusament", "FormFutura", "Fiberlogy", "Das Filament", "Extrudr",
  "Spectrum", "Velleman", "Raise3D", "Ultimaker", "Zortrax",
  "Rigid.ink", "3D-Fuel", "Filamentive", "Gizmo Dorks", "NovaMaker",
  "Kingroon", "TTYT3D", "PolyTerra", "PolyLite", "PolySonic",
  "Noctuo", "Fiberon", "Redline", "Other",
];

// ─── Material Families ────────────────────────────────────────────────────────
export const MATERIAL_FAMILIES = [
  "PLA", "PETG", "ABS", "ASA", "TPU", "PC", "PA", "PET",
  "PVA", "HIPS", "PEEK", "PEI", "Nylon", "Resin", "Other",
];

// ─── Material Subtypes ────────────────────────────────────────────────────────
export const MATERIAL_SUBTYPES: Record<string, string[]> = {
  PLA: ["Standard", "PLA+", "Tough", "Matte", "Silk", "Silk Rainbow", "Carbon Fiber", "Glass Fiber", "Wood Fill", "Metal Fill", "Marble", "Glow in the Dark", "High Speed", "Lightweight", "Recycled"],
  PETG: ["Standard", "PETG+", "Matte", "Carbon Fiber", "Glass Fiber", "High Speed", "Transparent"],
  ABS: ["Standard", "ABS+", "Carbon Fiber", "ESD", "Flame Retardant"],
  ASA: ["Standard", "UV Resistant", "Aero", "Carbon Fiber"],
  TPU: ["95A", "85A", "75A", "60D", "Conductive", "Carbon Fiber"],
  PC: ["Standard", "PC-ABS", "PC-PBT", "Carbon Fiber", "Transparent"],
  PA: ["Nylon 6", "Nylon 12", "PA-CF", "PA-GF", "PAHT", "PA6-CF"],
  PET: ["Standard", "Recycled", "Transparent"],
  PVA: ["Standard", "Fast-Dissolve"],
  HIPS: ["Standard"],
  PEEK: ["Standard", "Carbon Fiber"],
  PEI: ["Standard", "ULTEM 9085"],
  Nylon: ["Standard", "Carbon Fiber", "Glass Fiber", "Flexible"],
  Resin: ["Standard", "ABS-Like", "Flexible", "Dental", "Engineering"],
  Other: ["Custom"],
};

// ─── Spool Types ──────────────────────────────────────────────────────────────
export const SPOOL_TYPES = ["Standard", "Refill / Cardboard", "Reusable", "Bambu AMS", "Other"];
export const SPOOL_MATERIALS = ["Plastic", "Cardboard", "Recycled Cardboard", "Reusable / Metal", "None (Refill)", "Other"];

// ─── Advertised Weights ───────────────────────────────────────────────────────
export const ADVERTISED_WEIGHTS = [
  { label: "250g", value: 250 },
  { label: "500g", value: 500 },
  { label: "1 kg", value: 1000 },
  { label: "2 kg", value: 2000 },
  { label: "3 kg", value: 3000 },
  { label: "5 kg", value: 5000 },
];

// ─── Color Presets (40 organized by hue group) ────────────────────────────────
export const COLOR_PRESETS = [
  // Reds
  { name: "Crimson Red", hex: "#DC143C" },
  { name: "Tomato", hex: "#FF4500" },
  { name: "Coral", hex: "#FF6B6B" },
  { name: "Salmon", hex: "#FA8072" },
  // Oranges
  { name: "Orange", hex: "#FF8C00" },
  { name: "Amber", hex: "#FFBF00" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Peach", hex: "#FFCBA4" },
  // Yellows
  { name: "Yellow", hex: "#FFE600" },
  { name: "Lemon", hex: "#FFF44F" },
  { name: "Lime", hex: "#BFFF00" },
  { name: "Chartreuse", hex: "#7FFF00" },
  // Greens
  { name: "Green", hex: "#00C853" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Olive", hex: "#808000" },
  // Teals / Cyans
  { name: "Teal", hex: "#008080" },
  { name: "Cyan", hex: "#00BCD4" },
  { name: "Aqua", hex: "#00FFFF" },
  { name: "Sky Blue", hex: "#87CEEB" },
  // Blues
  { name: "Blue", hex: "#1565C0" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Cobalt", hex: "#0047AB" },
  { name: "Baby Blue", hex: "#89CFF0" },
  // Purples
  { name: "Purple", hex: "#7B1FA2" },
  { name: "Violet", hex: "#8B00FF" },
  { name: "Lavender", hex: "#B57BEE" },
  { name: "Magenta", hex: "#FF00FF" },
  // Pinks
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Rose", hex: "#FF007F" },
  { name: "Blush", hex: "#FFB6C1" },
  { name: "Bubblegum", hex: "#FFC1CC" },
  // Neutrals
  { name: "White", hex: "#F5F5F5" },
  { name: "Light Gray", hex: "#C0C0C0" },
  { name: "Gray", hex: "#808080" },
  { name: "Dark Gray", hex: "#404040" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "Brown", hex: "#795548" },
  // Specials
  { name: "Natural / Clear", hex: "#F0EAD6" },
  { name: "Metallic Silver", hex: "#A8A9AD" },
];

// ─── Color family classification ──────────────────────────────────────────────
export const COLOR_FAMILIES = [
  "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "White", "Gray", "Black", "Brown", "Metallic", "Transparent", "Other",
];

export function getColorFamily(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  const s = max === min ? 0 : (max - min) / (255 - Math.abs(2 * l * 255 - 255));
  if (s < 0.12) {
    if (l > 0.85) return "White";
    if (l < 0.15) return "Black";
    return "Gray";
  }
  const h = max === min ? 0 :
    max === r ? ((g - b) / (max - min) + 6) % 6 * 60 :
    max === g ? ((b - r) / (max - min) + 2) * 60 :
    ((r - g) / (max - min) + 4) * 60;
  if (h < 15 || h >= 345) return "Red";
  if (h < 45) return "Orange";
  if (h < 70) return "Yellow";
  if (h < 150) return "Green";
  if (h < 195) return "Teal";
  if (h < 260) return "Blue";
  if (h < 290) return "Purple";
  if (h < 345) return "Pink";
  return "Other";
}

// ─── Low stock threshold ──────────────────────────────────────────────────────
export const LOW_STOCK_THRESHOLD = 20; // percent
