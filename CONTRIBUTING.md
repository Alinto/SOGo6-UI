# Contributing to SOGo6-UI

> **Contributions are not open at this time.** This repository is not accepting pull requests or external contributions for now. The guidelines below are intended for the core team and may apply once contributions open.

Thank you for your interest in contributing. This project is the **web frontend** for [SOGo 6](https://github.com/Alinto/SOGo6-server).

## Before you start

1. Read **[`AGENTS.md`](./AGENTS.md)** — project layout, i18n rules, Redux/RTK patterns, testing, file naming.
2. Set up the app per **[`README.md`](./README.md)** (Node 24.22.1, overrides in `.env.local`, optional SOGo6-server).
3. For API work, understand the `/env` → backend URL flow documented in the README.

## Development workflow

```bash
npm install
cp .env.example .env.local   # optional: only the variables you want to override
npm run dev
```

Before opening a pull request:

```bash
npm run type-check
npm run lint
npm test
npm run check:translations
```

`npm run build` succeeds despite type or lint issues (`typescript.ignoreBuildErrors` in `next.config.mjs`, and `next build` no longer runs ESLint). Reviewers still expect no new type or lint error in changed code. Git hooks run lint-staged on commit and `npm run test:fast` on push.

## Pull requests

- Keep changes focused; one logical change per PR when possible.
- Add or update tests for behavior you change.
- Follow the conventions in [`AGENTS.md`](./AGENTS.md) (i18n, imports, file naming, feature structure).
- Update README or docs when you change deployment or configuration behavior.

## Internationalization

- Translation files live under `src/messages/` (`en/` is the reference locale).
- ESLint warns on JSX literals (`react/jsx-no-literals`); keys must be static strings.
- Run `npm run check:translations` (or `:missing`) after adding keys.

## Questions

Open a [GitHub issue](https://github.com/Alinto/SOGo6-UI/issues) for bugs, feature requests, or setup problems.
