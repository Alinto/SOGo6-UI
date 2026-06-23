Write focused Jest tests for @selection following SOGo6-UI conventions.

Goal: **meaningful coverage** (behavior users and maintainers care about), not exhaustive boilerplate. Pre-commit requires a test file for every `src/` source file except exclusions below.

## Pre-commit & file location

**Required path** (same extension as source):

```
src/[path]/[name].tsx  →  src/[path]/__tests__/[name].test.tsx
src/[path]/[name].ts   →  src/[path]/__tests__/[name].test.ts
```

**No test required** (lint-staged skips): `types.ts`, `__tests__/`, `__mocks__/`, `src/app/fakeApi/`, `src/app/env/`, `config/`, `public/`.

Examples:
- `src/features/address_books/hooks/use-address-book-contact-picker.ts` → `.../__tests__/use-address-book-contact-picker.test.ts`
- `src/features/address_books/components/contact-form.tsx` → `.../__tests__/contact-form.test.tsx`
- `src/app/[locale]/(loggedin)/address_books/[book_id]/page.tsx` → `.../__tests__/page.test.tsx`

After writing, run: `npm run test:fast -- --testPathPatterns="<filename>"`

## Global setup (do NOT duplicate)

`jest.setup.ts` already provides:
- `@testing-library/jest-dom` matchers
- `userEvent` with **`delay: null`** (fast, deterministic typing)
- Mocks: `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `crypto.subtle`, `TextEncoder`

Do **not** re-mock these. Import `jest-dom` in a test file only if you need matchers and want explicit local clarity (optional).

## Choose the right test shape

| Source type | Tooling | Typical `describe` blocks |
|-------------|---------|---------------------------|
| **UI component** | `render`, `screen`, `userEvent` | `basic rendering`, `configuration`, `accessibility`, `integration` |
| **Host / orchestrator** | mock child + hooks | loading/error states, dispatch, submit flows |
| **Custom hook** (`use-*.ts`) | `renderHook` only — no DOM | returns data, `skipToken`/args, loading flags |
| **Pure util** | direct imports | nominal cases + edge cases |
| **Feature types** (`*-types.ts`, not `types.ts`) | typed const fixtures | one meaningful property per exported type |

Use only blocks that apply — skip `responsive layout` / `children rendering` when irrelevant.

## Reference files (copy patterns from here)

- Hook: `src/features/address_books/hooks/__tests__/use-address-book-entries.test.ts`
- Component: `src/features/address_books/components/__tests__/contact-form.test.tsx`
- Host: `src/features/address_books/components/__tests__/contact-form-host.test.tsx`
- Page: `src/app/[locale]/(loggedin)/address_books/[book_id]/__tests__/page.test.tsx`
- Util: `src/features/address_books/utils/__tests__/map-contact-api-error.test.ts`

## Imports

- Source under test: `@/` path alias from `src/`
- `jest.mock()` targets: `@/...` **or** relative path to sibling modules (both are used in the repo)
- **Hoisting**: declare all `jest.mock()` **before** importing the module under test

```ts
const mockQuery = jest.fn()

jest.mock('@/features/foo/store/foo-api', () => ({
  useGetFooQuery: (arg: unknown) => mockQuery(arg),
}))

import { useFoo } from '@/features/foo/hooks/use-foo'
```

## Mock conventions

### next-intl (almost always mock in component tests)

```ts
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
```

Assert on translation keys (e.g. `'new_contact.string'`) or provide a small map when needed.

### Next.js / i18n navigation

```ts
jest.mock('next/navigation', () => ({
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}))
```

### Redux / RTK Query

- **Never** wrap in a real Redux `Provider` — mock hooks at module level
- Query: `jest.fn(() => ({ data: undefined, isLoading: false, isError: false }))`
- Mutation: `jest.fn(() => [jest.fn().mockReturnValue({ unwrap: jest.fn() }), { isLoading: false }])`
- Reassign return values in `beforeEach` via a shared `jest.fn()` mock

```ts
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ addressBooksUi: { /* minimal slice */ } }),
}))
```

For optional query args, assert `skipToken` from `@reduxjs/toolkit/query`.

### Child components & UI primitives

Mock heavy children or shadcn/Radix shells with `data-testid`:

```tsx
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  // …other exports used by the component
}))

jest.mock('../child-component', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <div data-testid="child" data-loading={props.isLoading} />
  ),
}))
```

### ReactDOM.createPortal (Radix popovers, etc.)

```tsx
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => (
    <div data-testid="portal">{children}</div>
  ),
}))
```

### API layer

No MSW in this project — mock RTK Query hooks or pure normalize/serialize functions, not `fetch`.

## Hook tests (`use-*.ts`)

```ts
import { renderHook } from '@testing-library/react'
import { skipToken } from '@reduxjs/toolkit/query'

// mocks…

describe('useMyHook', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns data from the query', () => {
    mockQuery.mockReturnValue({ data: [{ id: '1' }], isLoading: false, isFetching: false })
    const { result } = renderHook(() => useMyHook('book-1'))
    expect(result.current.items).toHaveLength(1)
  })

  it('uses skipToken when id is missing', () => {
    renderHook(() => useMyHook(null))
    expect(mockQuery).toHaveBeenCalledWith(skipToken)
  })
})
```

No `render` / `screen` unless the hook renders JSX.

## Component tests

```ts
import '@testing-library/jest-dom' // optional — already in jest.setup.ts
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('MyComponent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('…', async () => {
    const user = userEvent.setup() // delay already null globally
    // …
  })
})
```

## Query priority

1. `getByRole` / `getByLabelText` — real interactive UI (buttons, inputs)
2. `getByTestId` — mocked children or intentional `data-testid` in source (`data-testid="contact-form-dialog"`)
3. `getByText` — visible text or i18n keys when `useTranslations` returns identity
4. `querySelector('div[class*="…"]')` — last resort for Tailwind partial class checks

Prefer `getByRole('button', { name: '…' })` over clicking unlabeled icons.

## Async & timers

- Side effects / RTK on mount: `await waitFor(() => expect(…).toBeInTheDocument())`
- Debounced logic (300ms, etc.):

```ts
jest.useFakeTimers()
const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
// type, then:
jest.advanceTimersByTime(300)
await waitFor(() => expect(…))
jest.useRealTimers()
```

## CSS assertions

- `expect(el).toHaveClass('flex', 'gap-2')` — pass classes separately
- Inline: `expect(el.style.scrollbarWidth).toBe('thin')`

## What NOT to test

- Private implementation details, trivial passthroughs, third-party internals
- Duplicate coverage already in child component tests (for thin hosts, test orchestration only)
- Snapshot unless the file already uses snapshots (mostly `components/ui`)
- Anything mocked globally in `jest.setup.ts`

## Quality bar

- 3–8 focused `it` blocks per file is usually enough
- Each test should answer: *what user-visible behavior or contract breaks if this regresses?*
- Match naming and mock style of the nearest `__tests__` file in the same feature folder
