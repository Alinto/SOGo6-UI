Write comprehensive Jest tests for @selection following the SOGo project conventions.

## Setup
- Import `@testing-library/jest-dom` as first line
- Import `{ render, screen, waitFor }` from `@testing-library/react`
- Use path alias `@/` for all project imports
- `jest.setup.ts` already mocks: `matchMedia`, `ResizeObserver`, `IntersectionObserver` — do NOT re-mock these

## Mock conventions
- Mock ALL external dependencies with `jest.mock('@/...')` at module level
- Mock components with `data-testid` attributes for easy querying:

```tsx
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: any) => (
    <div data-testid="sidebar" {...props}>{children}</div>
  ),
}))
```

- Mock RTK Query hooks: `jest.fn(() => ({ data: undefined, isLoading: false, isError: false }))`
- Mock mutations: `jest.fn(() => [jest.fn(), { isLoading: false }])`
- next-intl is already aliased in jest config — no need to mock `useTranslations`
- Use `jest.clearAllMocks()` in `beforeEach`

## Test structure
Organize tests in nested `describe` blocks by category:
- `basic rendering` — presence of key elements in the DOM
- `configuration` — props, attributes, data attributes
- `custom styling` — CSS classes and inline styles
- `accessibility` — button tags, ARIA roles, keyboard access
- `integration` — child components rendered correctly
- `component stability` — consistent across multiple re-renders
- `responsive layout` — structural variations
- `children rendering` — multiple children, fragments

## Querying priority
1. `screen.getByTestId()` — for mocked components
2. `screen.getByRole()` — for real interactive elements (button, input, etc.)
3. `screen.getByText()` — for text content verification
4. `element.querySelector('div[class*="..."]')` — to find elements by partial class name

## CSS class assertions
- Use `toHaveClass('class-1', 'class-2')` with individual class names — not a single string
- For inline styles: `expect(element.style.scrollbarWidth).toBe('thin')`
- For partial class match: `container.querySelector('div[class*="gap-4"]')`

## Async
- Wrap async assertions in `waitFor()`
- For `useEffect` side effects: `await waitFor(() => expect(...).toBeInTheDocument())`
- For mutations called on mount: verify with `await waitFor(() => { ... })`

## Redux / RTK Query
- Mock the entire hook at module level, not inside tests
- For mutations, mock as: `jest.fn(() => [jest.fn(), { isLoading: false }])`
- For queries, mock as: `jest.fn(() => ({ data: undefined, isLoading: false, isError: false }))`
- Never wrap components in a real Redux Provider — mock the hooks instead

## Type-only files (`*-types.ts`)
- Instantiate each exported interface as a typed const
- Assert one meaningful property per interface
- Goal: verify the shape compiles and imports correctly, not runtime logic

## ReactDOM.createPortal
Mock it to render children inline for testability:
```tsx
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => (
    <div data-testid="portal">{children}</div>
  ),
}))
```

## What NOT to test
- Implementation details (internal state, private functions)
- Trivial getters/setters
- Third-party library internals
- Anything already covered by `jest.setup.ts` (`matchMedia`, `ResizeObserver`, `IntersectionObserver`)

## File location
Place the test file at: `src/[same-path-as-source]/__tests__/[filename].test.tsx`

Examples:
- `src/components/sidebar/app-sidebar.tsx` → `src/components/sidebar/__tests__/app-sidebar.test.tsx`
- `src/features/mails/mails-types.ts` → `src/features/mails/__tests__/mails-types.test.ts`
- `src/app/[locale]/(loggedin)/layout.tsx` → `src/app/[locale]/(loggedin)/__tests__/layout.test.tsx`
