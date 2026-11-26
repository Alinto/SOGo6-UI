# AGENTS.md - AI Coding Agent Configuration

This file provides context and guidelines for AI coding agents working on this project. It is the source of truth for conventions; tool-specific files (`.claude/`, `.cursor/`) build on it.

## Project Overview

**SOGo6-UI** is a modern web-based groupware frontend for the SOGo 6 server, providing email, calendar, address book, tasks and part of the administration. It's built with Next.js 16 and React 19 and talks to the [SOGo6-server](https://github.com/Alinto/SOGo6-server) API (`/api/user/v1`) directly from the browser.

Setup, environment variables, Docker and the full list of npm scripts are in [`README.md`](./README.md). Don't duplicate them here.

## Tech Stack

| Category             | Technology                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Framework            | Next.js 16 (App Router; Webpack in dev, Turbopack for `build`)    |
| Language             | TypeScript (strict mode)                                          |
| UI Library           | React 19                                                          |
| Styling              | Tailwind CSS, tailwind-merge, class-variance-authority            |
| Components           | shadcn/ui (Radix UI primitives)                                   |
| State Management     | Redux Toolkit + RTK Query                                         |
| Forms                | React Hook Form + Zod validation                                  |
| Internationalization | next-intl                                                         |
| Offline / PWA        | Serwist (service worker), Dexie (IndexedDB)                       |
| Testing              | Jest + React Testing Library; Playwright for e2e (`e2e/`)         |
| Linting              | ESLint + Prettier                                                 |
| Drag & Drop          | @dnd-kit                                                          |
| Calendar             | react-big-calendar                                                |
| Rich Text Editor     | CKEditor 5                                                        |

## Project Structure

```
src/
├── proxy.ts                # Next 16 proxy: locale routing, multi-domain rules, /fakeApi gating
├── app/                    # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   │   ├── (auth)/         # Login flow (/auth/login, /auth/login/pwd, SSO)
│   │   ├── (loggedin)/     # Authenticated app: mail (u/[account]/[folder]), calendars,
│   │   │                   #   address_books, tasks, notes, user_settings, admin_panel
│   │   ├── (others)/       # Standalone compose window
│   │   └── share/          # Web Share Target handler (PWA)
│   ├── env/                # GET /env: runtime config served to the browser
│   ├── fakeApi/            # Mock API used in development (see "API Integration")
│   ├── serwist/            # Service worker route
│   ├── ~offline/           # Offline fallback page
│   └── sw*.ts              # Service worker sources
├── components/             # Shared React components
│   ├── ui/                 # shadcn/ui base components
│   ├── calendar/, sidebar/, dnd/, shared-subscribe/
├── features/               # Feature modules (domain logic), see below
│   ├── address_books/  admin-panel/  app-data/  auth/  calendars/  jobs/
│   ├── mails/  notifications/  offline/  tasks/  themes/  user-profile/  user-settings/
├── hooks/                  # Shared React hooks
├── lib/
│   ├── api/                # API helpers
│   ├── auth/               # Auth utilities
│   ├── i18n/               # next-intl configuration
│   ├── redux/              # Store, base api slice (redux/api), listeners, middleware, SSE (redux/sse)
│   ├── validations/        # Shared Zod schemas
│   ├── env-service.ts      # Loads /env, API health check, fakeApi fallback
│   └── utils.ts            # cn() and small helpers
├── messages/               # Translations: en/ (reference) and fr/, split per feature (folders + JSON files)
└── types.ts                # Shared TypeScript types
```

## Coding Conventions

### File Naming

- Use **kebab-case** for file names: `list-item-mobile.tsx`
- Use `.tsx` for React components, `.ts` for utilities
- Test files: `__tests__/component-name.test.tsx`

### Component Patterns

- Use **functional components** with hooks
- Export components as named exports
- Place component-specific types in the same file or a sibling `types.ts`

### Imports

- Use the `@/` path alias for imports from `src/`:
  ```typescript
  import { Button } from '@/components/ui/button'
  import { useAppSelector } from '@/lib/redux/hooks'
  ```

### Exports

- use memo() for components that do not always need to re-render
- memo is declared at the export default line
  ```typescript
  export default memo(MyComponent)
  ```
- use export default only for React components

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes:
  ```typescript
  import { cn } from "@/lib/utils";
  className={cn("base-class", condition && "conditional-class")}
  ```
- Use `cva` (class-variance-authority) for component variants

### State Management

- Use Redux Toolkit for global state, RTK Query for server data
- Use React Hook Form for form state
- Use local state (`useState`) for UI-only state

### Internationalization

- **NEVER hardcode user-facing strings**
- Use `useTranslations()` hook from `next-intl`:
  ```typescript
  const t = useTranslations("mails");
  return <span>{t("inbox")}</span>;
  ```
- Translation keys must be static strings (no template literals or variables), so `check:translations` can verify them
- Add new keys to `src/messages/en/` (the reference locale), in the file or folder of the feature

### Forms & Validation

- Use React Hook Form with Zod schemas:
  ```typescript
  const schema = z.object({ email: z.string().email() })
  const form = useForm({ resolver: zodResolver(schema) })
  ```

## Testing Guidelines

### Running Tests

```bash
npm test                 # All tests with coverage
npm run test:fast        # Quick run without coverage (also run on git pre-push)
npm run test:related -- <files>   # Tests related to given files
npm run test:watch       # Watch mode
```

### Test Structure

- Place tests in `__tests__/` directories alongside source files
- Use React Testing Library for component tests
- Mock external dependencies in `src/__mocks__/`
- E2E tests live in `e2e/` (Playwright, `npm run test:e2e:pwa`)

### Test Patterns

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ComponentName", () => {
  it("should render correctly", () => {
    render(<ComponentName />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

## Development Commands

The most used ones (full list in the README "Scripts" section):

| Command                      | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `npm run dev`                | Dev server on port 3000 (Webpack)                     |
| `npm run build`              | Production build (Turbopack, `output: 'standalone'`)  |
| `npm run lint`               | ESLint on `src/` (tests excluded)                     |
| `npm run type-check`         | `tsc` (no emit)                                       |
| `npm test`                   | Jest                                                  |
| `npm run check:translations` | Verify translation keys (`:missing`, `:file <path>`)  |

`next.config.mjs` sets `typescript.ignoreBuildErrors`, so `npm run build` does not catch type errors: run `type-check` yourself. The repo currently has pre-existing type errors; make sure you add none in the files you touch.

## Important Patterns

### Feature Module Structure

Each feature in `src/features/` typically contains:

```
feature-name/
├── components/                # Feature-specific components
├── hooks/                     # Feature-specific hooks
├── store/
│   ├── <feature>-api.ts       # RTK Query endpoints (injected into the base api slice)
│   ├── <name>-slice.ts        # Redux slices (UI state)
│   └── <name>-cache.ts        # Cache update helpers, when needed
├── utils/                     # Utility functions
├── <feature>-types.ts         # TypeScript types
├── __tests__/
└── index.ts                   # Public exports of the feature (when present)
```

Example: `src/features/calendars/store/calendars-api.ts`, `calendar-ui-slice.ts`, `calendars-types.ts`.

### API Integration

- Use RTK Query; the base api slice is in `src/lib/redux/api/`
- The API base URL comes from `GET /env` at runtime (`REACT_APP_API_BASE_URL`), loaded by `src/lib/env-service.ts`
- `src/app/fakeApi/` provides mock endpoints. In development the app falls back to it when the real API is unreachable; it answers 404 in production unless `FAKE_API_ENABLED=true` (see `src/proxy.ts`). When you change an API contract, update the mock too
- Real-time updates use Server-Sent Events: see [`docs/SSE.md`](./docs/SSE.md)

### Route Groups

Next.js route groups in `app/[locale]/`:

- `(auth)` - Login pages
- `(loggedin)` - Authenticated app, including `admin_panel`
- `(others)` - Standalone compose window

### Multi-Domain Support

The app supports domain-based routing (`src/proxy.ts`, `NEXT_PUBLIC_ADMIN_DOMAINS`):

- Admin domains only access the admin panel
- User domains access all routes except the admin panel (allowed in development)

Details: [`docs/MULTI_DOMAIN.md`](./docs/MULTI_DOMAIN.md).

### Offline / PWA

`src/features/offline/` and the service worker (`src/app/sw.ts`) are behind `NEXT_PUBLIC_PWA_*` flags, off by default. See [`docs/pwa/`](./docs/pwa/README.md).

## UI Components (shadcn/ui)

Base components are in `src/components/ui/`. When creating new components:

1. Check if a shadcn/ui component exists first
2. Extend existing components rather than creating from scratch
3. Follow the Radix UI patterns for accessibility

## ESLint Rules

From `eslint.config.mjs` (applies to `src/`, tests excluded):

- `react/jsx-no-literals` (warning) - No hardcoded strings in JSX
- `@typescript-eslint/no-unused-vars` (warning, `_`-prefixed args allowed)
- `next/core-web-vitals` rules, including React Hooks rules
- A custom `custom/next-intl-translation-key` rule exists in `config/eslint-rules/` but is **not enabled**; static keys are a convention checked by `check:translations`

Treat warnings in the code you write as errors.

## Git Workflow

- Main branch: `main`
- Development branch: `develop`
- Use conventional commits when possible
- Husky: `pre-commit` runs lint-staged (ESLint `--fix`, Prettier, related Jest tests on staged files); `pre-push` runs `npm run test:fast`

## Common Gotchas

1. **Translation keys must be static** - Cannot use dynamic strings with `t()`
2. **Always use `@/` imports** - Avoid relative imports going up multiple levels
3. **Test coverage** - New components should have corresponding tests
4. **Accessibility** - Use semantic HTML and ARIA attributes
5. **Mobile-first** - Design for mobile, then adapt for desktop
6. **`NEXT_PUBLIC_*` values present at build time are frozen into the bundle** - Runtime configuration goes through `GET /env` instead

## Claude Code Setup (`.claude/`)

Shared, versioned configuration (personal overrides go in `.claude/settings.local.json`, git-ignored):

- **Hooks** (`.claude/settings.json`, scripts in `.claude/hooks/`, require `jq`)
  - After each file edit under `src/`: ESLint `--fix` + Prettier on that file. Remaining errors block; warnings (e.g. `react/jsx-no-literals`) are sent back as context.
  - Before Claude ends a turn: TypeScript errors, related Jest tests and missing translation keys, **limited to the files changed vs `HEAD`** (the repo has pre-existing type errors elsewhere). Failures send Claude back to fix them; a passing state is cached in `.git/claude-verify/`.
- **Skill `/ticket <id>`**: reads the OpenProject work package, proposes a plan, implements after approval, verifies, and drafts the commit message and OpenProject comment (nothing is posted or committed without approval).
- **Permissions**: read-only and check commands are pre-allowed; editing `.env*` / `.mcp.json` and force-pushing are denied.

## Documentation

- DON'T CREATE DOC IF NOT EXPLICITLY STATED IN THE PROMPT
- When you change behaviour described in a doc below, update that doc in the same change

Documentation in `docs/`:

- `SSE.md` - Server-Sent Events (real-time mail notifications)
- `MULTI_DOMAIN.md` - Admin / user domain routing
- `DEV_CONTAINER_API_SETUP.md` - Dev container and API connection
- `MAIL_SHARE_PERMISSIONS.md` - Mail folder sharing: simplified vs IMAP ACL rights
- `pwa/` - Offline / PWA: capabilities, QA checklist, decisions

## Environment Variables

See the README "Configuration" section and `.env.example`. Key points:

- Runtime config is served by `GET /env` (unauthenticated: never put secrets there): `REACT_APP_API_BASE_URL`, `SSE_ENABLED`, `LOGIN_PREFILL_*`
- `NEXT_PUBLIC_ADMIN_DOMAINS` - Comma-separated admin domain list
- `FAKE_API_ENABLED` - Serve `/fakeApi` in production builds (demo only)
- `NEXT_PUBLIC_PWA_*` - Offline / PWA feature flags (build time)
- Put local overrides in `.env.local` (git-ignored); `.env.development` is shared and versioned

---

_This file helps AI coding agents understand the project structure and conventions. Keep it updated as the project evolves._
