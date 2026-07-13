# Contributing to SOGo6-UI

Thank you for your interest in contributing. This project is the **web frontend** for [SOGo 6](https://github.com/Alinto/SOGo6-server).

## Before you start

1. Read **[`AGENTS.md`](./AGENTS.md)** — project layout, i18n rules, Redux/RTK patterns, testing, file naming.
2. Set up the app per **[`README.md`](./README.md)** (Node ≥ 22, `.env.development`, optional SOGo6-server).
3. For API work, understand the `/env` → backend URL flow documented in the README.

## Development workflow

```bash
npm install
cp .env.example .env.development 
npm run dev
```

Before opening a pull request:

```bash
npm run type-check
npm run lint
npm test
npm run check:translations
```

`npm run build` may succeed with type/lint issues because of `next.config.mjs` overrides — CI and reviewers still expect `type-check` and `lint` to pass for changed code.

Production builds use Turbopack by default (`npm run build`). Use `npm run build:webpack` if you need the legacy Webpack bundler.

## Pull requests

- Keep changes focused; one logical change per PR when possible.
- Add or update tests for behavior you change.
- Do not hardcode user-facing strings — use `next-intl` (`useTranslations`).
- Use `@/` imports from `src/`.
- Update README or docs when you change deployment or configuration behavior.

## Internationalization

- Translation files live under `src/messages/`.
- ESLint enforces static translation keys and no JSX literals.
- Run `npm run check:translations` after adding keys.

## Questions

Open a [GitHub issue](https://github.com/Alinto/SOGo6-UI/issues) for bugs, feature requests, or setup problems.
