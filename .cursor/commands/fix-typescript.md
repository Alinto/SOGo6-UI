Run a TypeScript check on the project and fix type errors progressively.

Steps:
1. Run `npm run type-check` in the terminal
2. List all errors grouped by file
3. Fix each error with minimal changes — no refactoring, only type corrections
4. Prioritize errors in src/features/ over src/app/
5. Do NOT add `// @ts-ignore` or `as any` — find the correct type
6. Re-run `npm run type-check` after fixes to confirm 0 errors in modified files

Goal: progressively reduce reliance on `ignoreBuildErrors: true` in next.config.
