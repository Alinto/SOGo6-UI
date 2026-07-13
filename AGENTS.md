# AGENTS.md - AI Coding Agent Configuration

This file provides context and guidelines for AI coding agents working on this project.

## Project Overview

**SOGo6-UI** is a modern web-based groupware frontend for the SOGo server, providing email, calendar, and address book functionality. It's built with Next.js 16 and React 19.

## Tech Stack

| Category             | Technology                                             |
| -------------------- | ------------------------------------------------------ |
| Framework            | Next.js 16 (App Router, Turbopack)                     |
| Language             | TypeScript (strict mode)                               |
| UI Library           | React 19                                               |
| Styling              | Tailwind CSS, tailwind-merge, class-variance-authority |
| Components           | shadcn/ui (Radix UI primitives)                        |
| State Management     | Redux Toolkit (RTK)                                    |
| Forms                | React Hook Form + Zod validation                       |
| Internationalization | next-intl                                              |
| Testing              | Jest + React Testing Library                           |
| Linting              | ESLint + Prettier                                      |
| Drag & Drop          | @dnd-kit                                               |
| Calendar             | react-big-calendar                                     |
| Rich Text Editor     | CKEditor 5                                             |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/           # Internationalized routes
│   │   ├── (admin)/        # Admin panel routes
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (loggedin)/     # Protected user routes
│   │   └── (others)/       # Other routes
│   ├── env/                # Environment API route
│   └── fakeApi/            # Mock API endpoints for development
├── components/             # Shared React components
│   ├── ui/                 # shadcn/ui base components
│   ├── calendar/           # Calendar-specific components
│   ├── sidebar/            # Sidebar components
│   └── dnd/                # Drag and drop components
├── features/               # Feature-based modules (domain logic)
│   ├── address_books/      # Address book feature
│   ├── admin-panel/        # Admin panel feature
│   ├── auth/               # Authentication feature
│   ├── calendars/          # Calendar feature
│   ├── mails/              # Email feature
│   ├── notifications/      # Notifications feature
│   ├── themes/             # Theme management
│   └── user-settings/      # User preferences
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
│   ├── auth/               # Auth utilities
│   ├── i18n/               # i18n configuration
│   └── redux/              # Redux store setup
├── messages/               # Translation files (JSON)
│   └── en/                 # English translations
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

- Use Redux Toolkit for global state
- Use React Hook Form for form state
- Use local state (`useState`) for UI-only state

### Internationalization

- **NEVER hardcode user-facing strings**
- Use `useTranslations()` hook from `next-intl`:
  ```typescript
  const t = useTranslations("mails");
  return <span>{t("inbox")}</span>;
  ```
- Translation keys must be static strings (enforced by ESLint)
- Add new translations to `src/messages/en/*.json`

### Forms & Validation

- Use React Hook Form with Zod schemas:
  ```typescript
  const schema = z.object({ email: z.string().email() })
  const form = useForm({ resolver: zodResolver(schema) })
  ```

## Testing Guidelines

### Running Tests

```bash
npm test              # Run all tests with coverage
npm run test:fast     # Quick run without coverage
npm run test:watch    # Watch mode
npm run test:changed  # Only changed files
```

### Test Structure

- Place tests in `__tests__/` directories alongside source files
- Use React Testing Library for component tests
- Mock external dependencies in `src/__mocks__/`

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

| Command                      | Description                  |
| ---------------------------- | ---------------------------- |
| `npm run dev`                | Start dev server (Turbopack) |
| `npm run build`              | Production build             |
| `npm run lint`               | Run ESLint                   |
| `npm run type-check`         | TypeScript type checking     |
| `npm test`                   | Run Jest tests               |
| `npm run check:translations` | Verify translation keys      |

## Important Patterns

### Feature Module Structure

Each feature in `src/features/` typically contains:

```
feature-name/
├── components/        # Feature-specific components
├── hooks/             # Feature-specific hooks
├── slice.ts           # Redux slice
├── api.ts             # RTK Query API
├── types.ts           # TypeScript types
└── utils.ts           # Utility functions
```

### API Integration

- Use RTK Query for API calls
- Fake API endpoints in `src/app/fakeApi/` for development
- SSE (Server-Sent Events) support for real-time updates (see `docs/`)

### Route Groups

Next.js route groups in `app/[locale]/`:

- `(admin)` - Admin panel pages
- `(auth)` - Login/authentication pages
- `(loggedin)` - Protected user pages
- `(others)` - Public pages

### Multi-Domain Support

The app supports domain-based routing:

- Admin domains (configured via `NEXT_PUBLIC_ADMIN_DOMAINS`) only access admin panel
- User domains access all routes except admin panel

## UI Components (shadcn/ui)

Base components are in `src/components/ui/`. When creating new components:

1. Check if a shadcn/ui component exists first
2. Extend existing components rather than creating from scratch
3. Follow the Radix UI patterns for accessibility

## ESLint Rules

Custom rules enforced:

- `react/jsx-no-literals` - No hardcoded strings in JSX
- `custom/next-intl-translation-key` - Translation keys must be static
- Standard React Hooks rules
- TypeScript strict checks

## Git Workflow

- Main branch: `main`
- Development branch: `develop`
- Use conventional commits when possible
- Husky runs pre-commit hooks (lint-staged)

## Common Gotchas

1. **Translation keys must be static** - Cannot use dynamic strings with `t()`
2. **Always use `@/` imports** - Avoid relative imports going up multiple levels
3. **Test coverage** - New components should have corresponding tests
4. **Accessibility** - Use semantic HTML and ARIA attributes
5. **Mobile-first** - Design for mobile, then adapt for desktop

## Documentation

- DON'T CREATE DOC IF NOT EXPLICITLY STATED IN THE PROMPT

Additional documentation in `docs/`:

- `MAIL_SSE_IMPLEMENTATION.md` - Server-Sent Events for mail
- `MULTI_DOMAIN_*.md` - Multi-domain configuration
- `DEV_CONTAINER_API_SETUP.md` - Dev container setup

## Environment Variables

Key environment variables:

- `NEXT_PUBLIC_ADMIN_DOMAINS` - Comma-separated admin domain list
- `LOGIN_PREFILL_EMAIL` / `LOGIN_PREFILL_PASSWORD` - Optional; runtime login prefill served via `GET /env` (dev/demo; readable by anyone who can hit `/env`). Legacy `NEXT_PUBLIC_LOGIN_PREFILL_*` on the server is still merged in `/env` if `LOGIN_*` are unset.
- See `README.md` and `.env.development` (or `.env.local`) for typical dev values

---

_This file helps AI coding agents understand the project structure and conventions. Keep it updated as the project evolves._
