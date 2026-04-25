// ─── Brand Catalog ────────────────────────────────────────────────────────────
export const BRANDS = [
  "3D Solutech", "3D Warhorse", "3D-Fuel", "3DHoJor", "3DQF", "3DXTech",
  "Amazon Basics", "Amolen", "Anycubic", "Atomic Filament", "Bambu Lab",
  "BASF Forward AM", "CC3D", "ColorFabb", "Creality", "Das Filament",
  "Deeplee", "DSM", "Duramic", "Elegoo", "Eryone", "eSun", "Extrudr",
  "Fiberlogy", "Fiberon", "Filamentive", "Fillamentum", "Flashforge",
  "FLSUN", "FormFutura", "Geeetech", "Giantarm", "Gizmo Dorks", "Hatchbox",
  "IC3D", "IEMAI", "Inland", "iSANMATE", "Jayo", "Kimya", "Kingroon",
  "MatterHackers", "NinjaTek", "Noctuo", "NovaMaker", "Other", "Overture",
  "PolyLite", "Polymaker", "PolySonic", "PolyTerra", "Proto-Pasta", "Prusa",
  "Prusament", "Raise3D", "Redline", "Rigid.ink", "Smartfil",
  "Spectrum Filaments", "Sunlu", "Taulman3D", "Tecbears", "TTYT3D",
  "Ultimaker", "Velleman", "Ziro", "Zortrax",
];

// ─── Material Families ────────────────────────────────────────────────────────
export const MATERIAL_FAMILIES = [
  "PLA", "PETG", "ABS", "ASA", "TPU", "PC", "PA", "PET",
  "PVA", "HIPS", "PEEK", "PEKK", "PEI", "Nylon", "Resin", "Support", "Composite", "Other",
];

// ─── Material Subtypes ────────────────────────────────────────────────────────
export const MATERIAL_SUBTYPES: Record<string, string[]> = {
  PLA: ["Standard", "PLA+", "Tough", "Matte", "Silk", "Silk Rainbow", "Carbon Fiber", "Glass Fiber", "Wood Fill", "Metal Fill", "Marble", "Glow in the Dark", "Conductive", "ESD", "HF", "HS", "High Temp", "Transparent", "Translucent", "Recycled", "Lightweight"],
  PETG: ["Standard", "PETG+", "Matte", "Carbon Fiber", "Glass Fiber", "Conductive", "ESD", "HF", "HS", "Transparent", "Translucent", "Recycled"],
  ABS: ["Standard", "ABS+", "Carbon Fiber", "Glass Fiber", "ESD", "Conductive", "Flame Retardant", "HF", "HS", "High Temp"],
  ASA: ["Standard", "UV Resistant", "Aero", "Carbon Fiber", "Glass Fiber", "ESD", "HF", "HS"],
  TPU: ["95A", "90A", "85A", "75A", "60D", "Flexible", "HF", "HS", "Conductive", "ESD", "Carbon Fiber"],
  PC: ["Standard", "PC-ABS", "PC-PBT", "Carbon Fiber", "Glass Fiber", "Transparent", "HF", "HS", "High Temp", "Flame Retardant"],
  PA: ["PA6", "PA12", "PA-CF", "PA-GF", "PAHT", "PA6-CF", "PA12-CF", "PA6-GF", "Flexible", "ESD", "HF", "HS", "High Temp"],
  PET: ["Standard", "Recycled", "Transparent", "Translucent", "HF", "HS", "High Temp"],
  PVA: ["Standard", "Fast-Dissolve", "Soluble Support", "Interface Support", "HF", "HS"],
  HIPS: ["Standard", "Support", "High Impact", "Soluble Support"],
  PEEK: ["Standard", "Carbon Fiber", "Glass Fiber", "ESD", "High Temp"],
  PEKK: ["Standard", "Carbon Fiber", "High Temp"],
  PEI: ["Standard", "ULTEM 9085", "ULTEM 1010", "Carbon Fiber", "High Temp"],
  Nylon: ["Nylon 6", "Nylon 12", "Carbon Fiber", "Glass Fiber", "Flexible", "ESD", "HF", "HS", "High Temp"],
  Resin: ["Standard", "ABS-Like", "Flexible", "Tough", "Dental", "Engineering", "High Temp", "Castable", "Transparent"],
  Support: ["PVA", "BVOH", "HIPS", "Breakaway", "Soluble", "Interface", "Support W", "Support G"],
  Composite: ["Carbon Fiber", "Glass Fiber", "Wood Fill", "Metal Fill", "Glow", "Conductive", "ESD", "Ceramic Fill"],
  Other: ["Custom", "Composite", "Support", "Soluble", "Conductive", "ESD", "Glow", "Metal Fill", "Wood Fill", "Carbon Fiber", "Glass Fiber", "High Speed", "High Temp", "Recycled", "Transparent", "Flexible"],
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
  "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Black", "White", "Gray", "Brown", "Metallic", "Transparent", "Other",
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
  if (h < 195) return "Blue";
  if (h < 260) return "Blue";
  if (h < 290) return "Purple";
  if (h < 345) return "Pink";
  return "Other";
}

// ─── Low stock threshold ──────────────────────────────────────────────────────
export const LOW_STOCK_THRESHOLD = 20; // percent
