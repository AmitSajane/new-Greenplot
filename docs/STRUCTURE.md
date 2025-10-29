# Project folder structure

This document describes the standard folder structure created by the assistant for this React Native project.

Top-level (created)
- src/ — application source code
  - components/ — reusable UI components
  - screens/ — screen-level components (pages)
  - navigation/ — navigation stacks and routes
  - hooks/ — custom React hooks
  - utils/ — general utilities and helpers
  - services/ — API clients, data/services layers
  - assets/ — static assets
    - images/ — images
    - fonts/ — custom fonts
  - types/ — TypeScript types and interfaces
  - constants/ — app-wide constants
- tests/ — unit tests and test utilities
- e2e/ — end-to-end tests
- scripts/ — helpful scripts for development or release
- docs/ — documentation (this file)
- .github/workflows/ — CI workflow files (placeholders)

Notes
- Existing project files (Android/iOS folders, package.json, README.md) were left unchanged.
- Empty folders contain `.gitkeep` so they are preserved in the repository.

Suggested next steps
- Move your existing source files into `src/` (for example `App.tsx` -> `src/App.tsx`).
- Add example components in `src/components` and example screen in `src/screens`.
- Add CI workflow YAML files to `.github/workflows` if you want CI.
- Remove any `.gitkeep` files once you add real files.

