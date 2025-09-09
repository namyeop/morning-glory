# Repository Guidelines

## Project Structure & Module Organization
- Source in `app/` (routes in `app/routes/*`, route table `app/routes.ts`, root layout `app/root.tsx`, shared components in `app/welcome/*`).
- Public assets in `public/` (e.g., `public/favicon.ico`).
- Config: `vite.config.ts`, `react-router.config.ts` (SSR enabled), `tsconfig.json` (strict TS; alias `~/*` → `app/*`).
- Build output in `build/` after `pnpm build` (`build/client`, `build/server`).
- Dockerfile builds and serves the production app.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server with HMR (React Router).
- `pnpm build`: Create production client/server bundles.
- `pnpm start`: Serve the built app from `build/server/index.js`.
- `pnpm typecheck`: Generate route types, then run `tsc`.
- Docker: `docker build -t morning-glory .` then `docker run -p 3000:3000 morning-glory`.

## Coding Style & Naming Conventions
- TypeScript, ES2022 modules, JSX (`react-jsx`). Use 2-space indentation.
- Components: PascalCase (e.g., `Welcome`). Variables/functions: camelCase.
- Routes: lowercase filenames under `app/routes/` (e.g., `home.tsx`).
- Imports: prefer `~/*` alias for internal paths.
- Styling: Tailwind CSS via Vite plugin.

## Testing Guidelines
- No test runner configured yet. Recommended: Vitest + React Testing Library.
- Place tests beside sources: `app/**/__tests__/*.{test,spec}.tsx` or `*.test.tsx`.
- Focus on route loaders/actions, components, and error boundaries.
- When tests are added, run with `pnpm test` (to be wired). Always run `pnpm typecheck` first.

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). Keep changes focused.
- PRs: Provide a clear summary, link issues (e.g., `Closes #123`), include screenshots/GIFs for UI changes.
- CI/Build: Ensure `pnpm typecheck` and `pnpm build` pass before review.

## Security & Configuration Tips
- SSR is enabled in `react-router.config.ts`. Toggle `ssr: false` if SPA-only is needed.
- Never commit secrets; use env vars and platform secret stores.
- Validate external inputs in loaders/actions and handle errors via `ErrorBoundary`.

