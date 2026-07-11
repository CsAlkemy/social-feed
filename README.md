# Appifylab Social

A social feed application built as a Turborepo monorepo with a Next.js (Pages Router) frontend and a NestJS backend.

## Structure

```
apps/
  web/                    # Next.js (Pages Router) + Tailwind CSS
  api/                    # NestJS REST API
packages/
  shared/
    library/              # @repo/library — functions, schema (zod), enum, entities
    ui/                   # @repo/ui — shadcn components (schadcn/), common components (common/)
  typescript-config/      # Shared tsconfig presets (base, nextjs, nestjs, react-library)
  eslint-config/          # Shared ESLint flat configs (base, next-js, nest-js, react-internal)
```

## Requirements

- Node.js >= 20
- Bun 1.3+

## Getting started

```bash
bun install

# copy env files
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# run everything (web on :3000, api on :3001)
bun run dev
```

## Scripts

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `bun run dev`         | Run all apps in watch mode        |
| `bun run build`       | Build all apps and packages       |
| `bun run lint`        | Lint all workspaces               |
| `bun run check-types` | Type-check all workspaces         |
| `bun run format`      | Format the codebase with Prettier |

## Apps

- **web** — `http://localhost:3000`, Next.js Pages Router, Tailwind CSS v4.
- **api** — `http://localhost:3001/api`, NestJS with a global `api` prefix. Health check at `GET /api/health`.
