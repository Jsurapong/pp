# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js)
npm run build        # production build
npm run lint         # ESLint
npm run sync-design  # pull latest design tokens from Claude Design bundle
```

No test framework is set up yet.

## Stack

Next.js 16 App Router · React 19 · TypeScript 5 · Ant Design 6 · Redux Toolkit · Tailwind CSS 4

App name: **TradeMaster** (Portfolio & Risk Management Platform)

## Architecture

### Route layout

```
src/app/
├── layout.tsx          ← root layout: wraps everything in AntdRegistry → StoreProvider → AntdProvider
├── page.tsx            ← root/landing page
└── (app)/              ← authenticated app route group
    ├── layout.tsx      ← mounts AppShell (Sider + Header)
    └── dashboard/page.tsx
```

All pages inside `(app)/` get the full shell automatically. Add new routes as `(app)/<name>/page.tsx`.

### Design system (`src/design-system/`)

Three files — keep them in sync:

| File | Role | Edit? |
|------|------|-------|
| `tokens.ts` | Single source of truth for all design values | Only after `sync-design` changes values |
| `antd-theme.ts` | Maps `tokens` → Ant Design `ThemeConfig` for `ConfigProvider` | Only to add new component overrides |
| `css-variables.css` | Auto-generated CSS custom properties | **Never** — overwritten by `sync-design` |

When `npm run sync-design` reports changed token values, manually update `tokens.ts` and `antd-theme.ts` to match.

### State management (`src/lib/`)

- `store.ts` — `makeStore()` with an empty reducer. Add slices here as the app grows.
- `hooks.ts` — typed `useAppDispatch` / `useAppSelector`. Use these instead of the raw Redux hooks.

### Skills (`.claude/skills/`)

- `/dev-feature` — 6-agent pipeline (PM → CTO → FE dev + BE dev + QA in parallel → Docs). Outputs land in `docs/dev-feature/<slug>/`.
- `/sync-design` — fetches the Claude Design bundle and updates `css-variables.css`.
