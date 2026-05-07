# Low Poly Generator

A modernized fork of [cojdev/lowpoly](https://github.com/cojdev/lowpoly), rebuilt with Vite, React 19, TypeScript, Tailwind CSS v4 and shadcn/ui.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn/ui primitives (Radix UI under the hood)
- pnpm

## Getting started

```sh
pnpm install
pnpm dev
```

Other scripts:

- `pnpm build` — type-check and build to `dist/`
- `pnpm preview` — preview the production build
- `pnpm typecheck` — type-check only
- `pnpm lint` — lint with ESLint
- `pnpm format` — format with Prettier

## Brand palette

The default colors are from our own palette. Eight named gradients are exposed as Tailwind/CSS custom properties (`--gradient-ocean`, `--gradient-deep`, `--gradient-sunset`, `--gradient-forest`, `--gradient-royal`, `--gradient-warm`, `--gradient-cyber`, `--gradient-mist`).

## Notes on the port

- Replaced `styled-components` and `polished` with Tailwind utility classes and shadcn primitives.
- Replaced `mathjs` with vendored 3-vector dot/cross helpers in `src/lib/vector.ts`.
- Replaced `react-feather` with `lucide-react` (already pulled in by shadcn).
