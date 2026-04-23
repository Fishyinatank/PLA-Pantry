# PLA Pantry TODO

## Phase 1: Database & Backend
- [x] Define filaments table in drizzle/schema.ts
- [x] Generate and apply migration SQL
- [x] Add filament CRUD query helpers in server/db.ts
- [x] Add filament tRPC procedures in server/routers.ts (list, create, update, delete, stats)

## Phase 2: Design System & Layout
- [x] Dark-mode premium CSS theme (index.css) with gold accent
- [x] Google Font (Inter + Space Grotesk) in index.html
- [x] App.tsx: dark theme, routes for all pages
- [x] AppLayout sidebar with all nav items (Filaments, Stats, Collections, Alerts, Orders, Integrations, Settings)
- [x] Sidebar active state, hover states, and mobile responsiveness
- [x] Sidebar collapse toggle

## Phase 3: Filaments Page
- [x] Filaments page with inventory grid/list toggle
- [x] SpoolCard component with color swatch, material badge, remaining % bar, brand/name
- [x] Search bar with instant filtering
- [x] Filter panel: brand, material, low-stock toggle
- [x] Sort controls: by recent, brand, material, remaining %
- [x] Polished empty state
- [x] Loading skeleton for spool cards

## Phase 4: Add/Edit Spool Modal
- [x] Centered modal with background blur and scale/fade animation
- [x] Brand search with live-filtering dropdown (40+ brands)
- [x] Material family selector (PLA, PETG, ABS, ASA, TPU, PC, PA, etc.)
- [x] Material subtype selector (dynamic based on family)
- [x] Color picker button with color name field
- [x] Right-side color panel: 40 organized presets + manual picker + hex input
- [x] Color panel slide-in/out animation; selecting color closes panel and updates spool preview
- [x] Advertised weight quick-select (250g, 500g, 1kg, 2kg, 3kg, 5kg)
- [x] Spool type and spool material fields
- [x] Weight method toggle (empty-spool vs full-spool)
- [x] Dynamic weight input fields based on method
- [x] Current total weight input
- [x] Auto-calculation of remaining grams and percentage with live preview
- [x] Notes, purchase link, supplier, storage location fields
- [x] Dry-box flag toggle
- [x] Save/Cancel with validation and error states
- [x] Edit mode: pre-fill form with existing spool data
- [x] Delete with confirmation dialog

## Phase 5: Stats Page
- [x] Total spool count card
- [x] Total filament weight card
- [x] Low-stock count card
- [x] Average remaining % card
- [x] Brand distribution bar chart (Recharts)
- [x] Material distribution pie chart (Recharts)

## Phase 6: Secondary Pages
- [x] Collections page (polished coming-soon with planned features)
- [x] Alerts page (polished coming-soon with planned features)
- [x] Orders page (polished coming-soon with planned features)
- [x] Integrations page (polished coming-soon with planned features)
- [x] Settings page (profile, dark mode toggle, export, sign out)

## Phase 7: Polish & QA
- [x] Loading skeletons on all data-fetching pages
- [x] Hover/pressed/selected/disabled states on all interactive elements
- [x] Smooth card hover transitions (card-hover class)
- [x] Optimistic UI updates for spool delete
- [x] Vitest tests for filament procedures (9 tests passing)
- [x] Mobile-responsive layout
