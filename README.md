# Patent 3D Viewer

Interactive 3D viewer for mechanical patent drawings with assembly controls, exploded views, animation, AI supplier lookup, and printable export.

## Features

- Switch between two patent datasets (loom and clutch).
- Orbit and inspect 3D parts with click selection.
- Toggle assembly visibility, isolate assemblies, and show all.
- Exploded view and drive animation controls.
- AI supplier lookup for selected parts via backend Claude + web search.
- Export is **component-based (selection-based)**:
  - Click a part to select it, then export to generate an `STL` or `3MF` for the **selected component only**.
  - If nothing is selected, export uses the **current visible model subtree** (respecting assembly visibility and exploded state).
- Optional `Strict Print Mode` that blocks export on invalid print topology.
- Live printability status badge (`Printable`, `Warning`, `Blocked`) with details panel.

## Tech Stack

- Vite 8
- React 19
- three 0.160
- @react-three/fiber v9
- @react-three/drei v10
- zustand 4
- Express backend for supplier lookup

## Getting Started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

Create `.env` at repo root:

```bash
ANTHROPIC_API_KEY=your_key_here
```

### 3) Run frontend

```bash
pnpm dev
```

### 4) Run backend (separate terminal)

```bash
cd server
npm install
node index.js
```

Vite dev server proxies `/api` to `http://localhost:3001`.

## Commands

```bash
# Frontend
pnpm dev
pnpm build
pnpm lint

# Backend
cd server && node index.js
cd server && node --watch index.js
```

## Printable Export Notes

- Export operates on the current model subtree (never includes lights, ground, or shadows).
- If a part is selected, export filters to that **selected component** (component-based export).
- If nothing is selected, export uses the **current visible model subtree** (respecting assembly visibility and exploded state).
- `3MF` is generated with millimeter units.
- Cleanup and validation (weld duplicate vertices, remove degenerate/duplicate triangles) run before export.
- In strict mode, export is blocked if topology checks fail (open edges, non-manifold edges, invalid vertices).

## Project Structure

- `src/components/` - 3D scene, assemblies, and UI.
- `src/data/` - patent datasets and normalization.
- `src/hooks/` - animation and scene helpers.
- `src/store.js` - global app state.
- `src/utils/modelExport.js` - STL/3MF export, cleanup, and printability checks.
- `server/` - Express supplier lookup API.

