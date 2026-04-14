# Patent 3D Viewer — CLAUDE.md

## Project overview

Interactive 3D viewer for mechanical patent drawings. Users can orbit, click parts to inspect them, toggle assembly visibility, trigger an exploded view, animate motion sequences, and export the current model state to printable formats. Selecting a part surfaces a **"Find Supplier"** button that calls a Node.js backend powered by the Anthropic Claude SDK — Claude uses its built-in `web_search` tool to find a real supplier URL for the part.

Built with Vite 8 + React 19, @react-three/fiber v9, @react-three/drei v10, three 0.160, zustand 4.

## Commands

```bash
# Frontend
pnpm dev       # start Vite dev server (proxies /api → localhost:3001)
pnpm build     # production build
pnpm lint      # ESLint

# Backend (run in a separate terminal)
cd server && node index.js        # start supplier API server on :3001
cd server && node --watch index.js  # with auto-restart on changes
```

`ANTHROPIC_API_KEY` must be set in `.env` at the project root (gitignored).

## Architecture

### Data layer (`src/data/`)

- `loom_bom.json` — Patent US4529014A (Power Loom). Schema: `components[]`, `assembly_groups[]`, `relationships[]`, `motion_sequences[]`.
- `patent.json` — Patent US4441528A (Clutch Arrangement). Schema: `bom[]`, `assemblies{}`, `materials[]`.
- `datasets.js` — Normalizes both JSONs into a common shape consumed by all UI components:
  ```js
  { id, title, assignee, assemblyGroups: [{name, componentIds, description}], components: {[id]: {id, name, material, description, ...}} }
  ```
  Always add new datasets here and normalize them to this shape.

### State (`src/store.js`)

Single zustand store:
- `activePatent: 'loom' | 'clutch'` — which dataset/scene is shown
- `setPatent(key)` — switches dataset, resets all other state including `supplierCache`
- `selectedRef: string | null` — selected part id (e.g. `'C001'` or `'1'`)
- `visibleAssemblies: Record<name, boolean>`
- `exploded: boolean`
- `animating: boolean`
- `supplierCache: Record<partId, {supplier, url, blurb}>` — cached AI supplier results; keyed by part id, cleared on patent switch
- `setSupplier(partId, data)` — writes one entry into the cache
- `exportModel: ((opts) => report) | null` — scene-registered export/analyze handler used by `Controls`
- `setExportModel(fn | null)` — registers/unregisters export/analyze handler

### 3D scene (`src/components/`)

**Part primitives** (`parts/`) — reusable geometry components. All accept `partRef`, `material`, standard R3F transform props, and wire up click/hover to the store.

| File | Geometry |
|---|---|
| `Shaft.jsx` | CylinderGeometry |
| `Disc.jsx` | ExtrudeGeometry (shape with hole, optional slots, eccentric offset) |
| `Spring.jsx` | TubeGeometry along a custom HelixCurve |
| `Lever.jsx` | ExtrudeGeometry (1, 2, or 3-armed) |
| `Pawl.jsx` | ExtrudeGeometry with nose/tooth |
| `Pin.jsx` | Small CylinderGeometry |
| `ElectroMagnet.jsx` | Box + cylinder + torus composite |
| `Housing.jsx` | BoxGeometry |

**Assembly components** (`assemblies/`) — each assembly:
1. Reads `visibleAssemblies[name]` from store — returns `null` if hidden
2. Uses `useExplode(explodeOffset)` hook to animate position on explode toggle
3. Composes part primitives with patent-accurate relative positioning

Loom assemblies (US4529014A): `FrameAssembly`, `WarpSystem`, `ClothTakeupSystem`, `SheddingMechanism`, `WeftInsertionSystem`, `BeatupMechanism`, `TreadleSystem`, `DriveSystem`

Clutch assemblies (US4441528A): `DriveAssembly`, `PawlClutchSystem`, `ControlLeverMechanism`, `StrokeMemberAssembly`, `ProgramControl`, `MonitoringSystem`

**Scene.jsx** — Canvas setup with lighting, OrbitControls, ground plane, and conditional `<LoomScene>` or `<ClutchScene>` based on `activePatent`. Also registers export/analyze callbacks against the printable model subtree.

**UI components** (`ui/`) — all use `datasets[activePatent]` so they work with any patent:
- `InfoPanel.jsx` — fixed bottom-right, shows selected part details + "Find Supplier" button that calls `/api/supplier` and displays a clickable supplier link; result cached in zustand per part id
- `AssemblySidebar.jsx` — fixed left, list with visibility toggles and isolate
- `Controls.jsx` — fixed bottom-center, explode/animate/reset plus `STL`/`3MF` export, optional strict print mode, live status badge, and preflight details panel

### Export utility (`src/utils/modelExport.js`)

- Exports current model state to:
  - binary `STL` via Three.js `STLExporter`
  - packaged `3MF` with `[Content_Types].xml`, `_rels/.rels`, and `3D/3dmodel.model`
- Runs cleanup before report/export:
  - weld duplicate vertices (scoped per source mesh)
  - remove degenerate triangles
  - remove duplicate faces (scoped per source mesh)
- Computes printability stats:
  - triangle count, open edges, non-manifold edges, shell count, invalid vertices
- Strict mode blocks export on topology failures.

### Materials (`components/materials/useMaterials.js`)

Returns memoized `THREE.MeshStandardMaterial` instances keyed by material name. Includes both title-case keys (clutch dataset) and lowercase keys (loom dataset). Add new keys here when adding new datasets.

### Hooks (`src/hooks/`)

- `useExplode(explodeOffset)` — returns a `groupRef`, uses `useFrame` to lerp group position between `[0,0,0]` and `explodeOffset` based on `store.exploded`.

## Key conventions

- **Part selection**: each mesh `onClick` calls `e.stopPropagation()` then `setSelected(partRef)`. Clicking the ground deselects.
- **Pointer cursor**: set `document.body.style.cursor` on `onPointerOver`/`onPointerOut`.
- **UI pointer events**: the `.ui-layer` container is `pointer-events: none`. Every interactive UI element must have `pointer-events: auto` on its own element or a parent with a specific class that sets it.
- **Material cloning**: always `.clone()` a material before setting `emissive` on it — materials are shared instances from `useMaterials`.
- **Custom geometries**: wrap in `useMemo` to avoid recreating on every render.
- **Animation**: use `useFrame` with `delta` for frame-rate independent motion. Animate refs directly; don't set state in `useFrame`.
- **Export scope**: only export the printable model group in `Scene`; never include ground plane, shadows, controls, or environment artifacts.

## Supplier lookup backend (`server/`)

A standalone Express server (`server/index.js`) separate from the Vite frontend.

- **Endpoint**: `POST /api/supplier` — accepts `{ partName, material?, description?, dimensions? }`
- **Returns**: `{ supplier: string, url: string, blurb: string }`
- **Model**: `claude-sonnet-4-6` with the `web_search_20250305` built-in tool
- **Agentic loop**: the server drives the tool-use loop itself — Claude may issue multiple web searches before producing a final JSON answer
- **JSON extraction**: response is stripped of markdown fences and a `/{...}/` regex extracts the object in case Claude adds surrounding prose
- Vite proxies `/api` → `http://localhost:3001` in dev (configured in `vite.config.js`)
- Server deps are in `server/package.json` (separate from the frontend); install with `npm install` inside `server/`

## Adding a new patent

1. Add the JSON file to `src/data/`
2. Add a normalization function in `datasets.js` and export it under a new key
3. Add the key to `store.js` `setPatent` (it will work automatically via `datasets[key]`)
4. Create assembly components in `src/components/assemblies/`
5. Add a `<YourScene>` component in `Scene.jsx` and include it in the conditional
6. Add a tab button in `App.jsx` `PatentHeader`
