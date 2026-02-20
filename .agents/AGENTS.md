# JS Heap Inspector — Project Context for Agents

This document provides a high‑signal overview for AI agents (Claude Code, OpenCode, etc.) to understand the monorepo layout, responsibilities of each package, data flows, and the safest ways to extend or integrate with the project.

## Monorepo Overview
- Package manager: `yarn@4` workspaces
- Node: `>=20`
- TypeScript: `>=5.7`
- Python (data‑science package): `>=3.8`
- Top‑level workspaces: `./packages/@*/*`, `./packages/@*`, `./experiments`

The repository is centered on analyzing V8 heap snapshots and deriving causal links between code evolution and memory/runtime behavior. It contains:
- TypeScript libraries with domain models/utilities
- A TypeScript CLI orchestrating the full analysis pipeline
- A Python data‑science module performing heavy analytics/visualizations
- A NestJS gateway (API) for serving the functionality (early stage)
- Playwright experiments that generate performance data feeding the pipeline

## Packages (What they do)

### 1) `@js-heap-inspector-lib/core`
Purpose: Core TypeScript domain model and services used across the toolchain.
- Entry point: `packages/@js-heap-inspector-lib/core/public_api.ts`
  - Re‑exports `./entities` and `./services`
- Dependencies: lightweight (`js-big-decimal`); intended to be runtime‑agnostic and reusable
- Consumers: primarily the CLI and any future TS applications (e.g., the NestJS gateway)
- Design: keep it pure/decoupled; no direct Node/web framework dependencies

### 2) `@js-heap-inspector-lib/common`
Purpose: Cross‑cutting TypeScript pieces shared by multiple packages.
- Entry point: `packages/@js-heap-inspector-lib/common/src/public_api.ts`
  - Re‑exports `./types`, `./infrastructure`, `./helpers`
- Use for: common types, minor infrastructure utilities, helpers
- Consumers: `core`, CLI, future apps

### 3) `@js-heap-inspector/causal-link-cli`
Purpose: TypeScript CLI to run the end‑to‑end causal link analysis workflow for V8 heaps.
- Declared deps: `@js-heap-inspector/core`, `commander`
- Key scripts (see `packages/@js-heap-inspector-causal-link-cli/package.json`):
  - `playwright-performance-reporter-converter`: converts Playwright performance JSON → `.heapsnapshot`
  - `v8:runtime-converter`: converts `.heapsnapshot` → `*.runtime.json` (V8 runtime format used downstream)
  - `v8:causal-link`: calls Python analytics to compute causal links, outputting `result.json` + a report folder
  - Preset pipelines (heuristic/primitive/community-detection) and `TARGET_APP` presets for the "otter" showcase data
- Orchestration: invokes Python modules from `@js-heap-inspector-data-science` via `PYTHONPATH` and `python ...`
- Outputs: `result.json` and visualization/report artifacts under per‑run directories

### 4) `@js-heap-inspector-data-science` (Python)
Purpose: Data‑science/analytics layer for runtime and heap analysis; plotting and reporting.
- Packaging: `pyproject.toml` (name: `runtime_analyzer`)
- Deps: `pydantic`, `numpy`, `matplotlib`, `seaborn`, `pandas`; optional `pytest` for tests
- Entrypoints/examples: e.g., `src/causal_link.py`, `src/visualization.py`, and analysis/visualizer services
- Used by: the CLI (via subprocess) to compute causal links and generate visualizations/reports
- Outputs: CSV/JSON summaries, figures/heatmaps (e.g., resolution/file size heatmaps), and final structured results

### 5) `@js-heap-inspector/gateway` (NestJS)
Purpose: API gateway (early stage) to surface analysis capabilities via HTTP.
- Tech: NestJS v11 (see `package.json`), Jest for tests
- Example module scaffold: `src/modules/work-orders` (CRUD placeholders)
- Local best‑practices for agents: see `packages/@js-heap-inspector-gateway/.agents/skills/nestjs-best-practices/AGENTS.md`
- Current state: minimal; plan is to integrate analysis pipelines and expose them as endpoints/jobs

### 6) `experiments`
Purpose: Playwright scenarios producing performance data that feeds the pipeline.
- Scripts (see `experiments/package.json`): run showcase tests for the "otter" app (simple/extensive)
- Artifacts: performance JSON used by the CLI converter step; repeated runs for statistical robustness
- Relationship: the CLI’s `playwright-performance-reporter-converter` consumes these results

## End‑to‑End Data Flow (Typical)
1) Collect performance data (or raw V8 snapshots)
   - Run Playwright tests in `experiments` to produce baseline and modified JSONs
   - Or obtain `.heapsnapshot` files directly
2) Normalize to runtime format
   - CLI `v8:runtime-converter` converts `.heapsnapshot` → `*.runtime.json`
3) Compute causal links + report
   - CLI `v8:causal-link` invokes Python analytics with optional mode settings
   - Outputs: `result.json` + a report folder (charts/CSVs)
4) Serve or consume results
   - Future: the NestJS gateway will expose endpoints for submitting inputs and retrieving results
   - Libraries (`core`, `common`) provide shared models/services for downstream consumers

## How to Run (quick reference)
- Install deps (root):
  ```bash
  yarn install
  ```
- Run experiments (examples):
  ```bash
  yarn workspace experiments otter-showcase-simple
  yarn workspace experiments otter-showcase-extensive
  ```
- Full pipeline on OTTER presets (CLI workspace):
  ```bash
  # choose one preset and run, e.g. community detection on the simple showcase:
  yarn workspace @js-heap-inspector/causal-link-cli v8:full-causal-link:otter-simple-showcase:community-detection-1
  ```
- Start the API gateway (dev):
  ```bash
  yarn workspace @js-heap-inspector/gateway start:dev
  ```

## Conventions & Architecture Rules for Agents
- Keep cross‑language boundaries clear:
  - TypeScript CLI orchestrates Python via `PYTHONPATH` + `python` commands; do not embed Python directly in TS
  - Exchange through files/JSON; prefer stable schemas
- Dependency direction:
  - `common` → `core` → apps (CLI, gateway)
  - Python DS package is separate and called from the CLI
- Public API boundaries:
  - TS libs export only through their `public_api.ts` files; respect these surfaces
- Coding standards:
  - TypeScript: XO/eslint in repo; Node >= 20; TS >= 5.7
  - NestJS contributions must follow: `packages/@js-heap-inspector-gateway/.agents/skills/nestjs-best-practices/AGENTS.md`
  - Python: adhere to `pydantic` models and keep plotting/data transforms deterministic where feasible (seed RNG if needed)
- Testing:
  - Gateway: Jest
  - Python DS: Pytest (declared optional dep)
  - Add unit tests for non‑trivial logic in `core/common`; avoid duplicating coverage across layers
- Data contracts:
  - Define/extend schemas for `*.runtime.json`, `result.json`, and reporting folders when changing analysis outputs

## Glossary
- `heapsnapshot`: Raw V8 heap dump
- `runtime.json`: Normalized representation used by analytics
- `causal link`: Mapping from code evolution/runtime artifacts to memory effects
- `community detection` / `heuristic greedy`: Alternative algorithms/modes for analysis

## Where to Look Next
- CLI scripts and `modes/*.json` in `@js-heap-inspector/causal-link-cli`
- Python analysis services in `@js-heap-inspector-data-science/src`
- Core types/services in `@js-heap-inspector-lib/core/public_api.ts`
- Nest best practices for agents:
  `packages/@js-heap-inspector-gateway/.agents/skills/nestjs-best-practices/AGENTS.md`
