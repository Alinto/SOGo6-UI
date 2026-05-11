---
name: migrate-endpoint
description: Use when migrating an API endpoint from fakeApi to the real SOGo backend.
  Activated when user mentions migration, real backend, fake API, or endpoint integration.
---

# Migrate Endpoint — SOGo

## Context
- Fake API: `src/app/fakeApi/` (Next.js Route Handlers, dev only)
- Real backend: Python/Flask SOGo — base URL from `fetchEnvVars()` via `dynamicBaseQuery`
- Auth: JWT injected automatically via `prepareHeaders` in @src/lib/redux/api/api-slice.ts

## Migration steps
1. Identify the fake API route in `src/app/fakeApi/` and its response shape
2. Find the matching RTK Query endpoint in `src/features/*/store/*.api.ts`
3. Update the URL to the real backend format (see existing `/api/user/v1/` endpoints)
4. Add or update `transformResponse` to handle the real backend's `BackendResponse<T>` wrapper
5. Verify `providesTags` / `invalidatesTags` cover all affected cache tags
6. Keep the fakeApi route intact — it stays as automatic fallback when backend is unreachable

## Dual-format transformResponse pattern
The real backend wraps responses: `{ data: T, error_code: string, error_msg: string }`
The fake API returns data directly.
Handle both:
```typescript
const payload = 'data' in response ? response.data : response
