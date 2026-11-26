# Server-Sent Events (SSE)

Real-time push from the backend to the browser, used today only to insert newly
received mails into the mail list cache. Code lives in `src/lib/redux/sse/`.

## Data flow

```
GET /env  -> SSE_ENABLED (src/lib/env-route-payload.ts)
   |
src/app/[locale]/(loggedin)/layout.tsx
   useEffect: fetchEnvVars() -> if SSE_ENABLED !== false
              getSSEConfigForEnvironment() -> connect(config)   // useConnectSSEMutation
   |
sseApi.connectSSE (src/lib/redux/sse/sse-api.ts)
   re-checks SSE_ENABLED, disconnects any previous instance,
   creates `new SSEService(config)` and calls connect()
   |
SSEService (src/lib/redux/sse/sse-service.ts)
   new EventSource(config.url), listens to `open`, `error`,
   `message` and the named event `mail:received`
   |
useMailReceivedListener (src/lib/redux/sse/hooks/use-mail-received-listener.ts)
   mounted through MailSSEListener, subscribes to `mail:received`
   and prepends the mail with apiSlice.util.updateQueryData('getFolderMessages', ...)
```

The connection is opened once for the whole logged-in tree. `sseApi` is
registered in `src/lib/redux/store.ts` (reducer + middleware).

## Configuration

### `SSE_ENABLED`

Served by `GET /env` (`buildEnvRoutePayload` in `src/lib/env-route-payload.ts`):

| `NODE_ENV`               | Default  | Rule                                    |
| ------------------------ | -------- | --------------------------------------- |
| `development`            | disabled | enabled only if `SSE_ENABLED=true`      |
| anything else (prod...)  | enabled  | disabled only if `SSE_ENABLED=false`    |

`.env.development` and `.env.local` set `SSE_ENABLED=false`. On the client, the
layout and `sseApi` both treat anything other than an explicit `false` as enabled.

### Endpoint URL

`getSSEConfigForEnvironment()` (`src/lib/redux/sse/sse-config.ts`) picks:

- **production** (`NODE_ENV=production`, browser): `getProductionSSEConfig()`,
  URL `${window.location.origin}/api/sse` (same-origin reverse proxy).
- **test**: `getTestSSEConfig()`, URL `/fakeApi/sse`.
- **otherwise** (dev, or server side): `getDefaultSSEConfig()` /
  `getDefaultSSEConfigSync()`, which call `buildSSEConfig(REACT_APP_API_BASE_URL)`
  and produce `${REACT_APP_API_BASE_URL}/sse` (trailing slash stripped; falls back
  to `/fakeApi`). In development `REACT_APP_API_BASE_URL` defaults to
  `http://127.0.0.1:5000/api/user/v1`.

`getDevelopmentSSEConfig()` is deprecated and just returns `getDefaultSSEConfigSync()`.

## Public API

Everything below is re-exported from `@/lib/redux/sse` (`index.ts`):

| Export                                    | Purpose                                                               |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `useConnectSSEMutation`                   | Connect; argument is an `SSEConfig` (or nothing to reuse the instance) |
| `useDisconnectSSEMutation`                | Close the current connection                                          |
| `useGetSSEStatusQuery`                    | `{ state, messageCount, reconnectAttempts, lastMessageTime }` snapshot |
| `useSubscribeToEventsQuery`               | Stub, always returns `[]` (see limitations)                           |
| `getSSEServiceInstance()`                 | The `SSEService` created by `sseApi` (or `null`)                       |
| `initSSEApi(config)`                      | Create the `sseApi` instance without connecting                       |
| `sseApi`                                  | RTK Query slice (`reducerPath: 'sseApi'`)                             |
| `SSEService`                              | Class: `connect`, `disconnect`, `subscribe(type, handler)`, `onStateChange`, `onError`, `getState`, `getStats` |
| `getSSEService`, `initializeSSEService`, `resetSSEService` | Second, unused singleton in `sse-service.ts`        |
| `buildSSEConfig`, `getDefaultSSEConfig`, `getDefaultSSEConfigSync`, `getProductionSSEConfig`, `getTestSSEConfig`, `getDevelopmentSSEConfig`, `getSSEConfigForEnvironment` | Config builders |
| `SSEConnectionState`, `SSEConfig`, `SSEEvent`, `SSEMessage` | Types (`types.ts`)                               |

`useGetSSEStatusQuery` reads the stats once per query; it is not pushed on state changes.

## Mail listener

- Component: `src/features/mails/components/mail-sse-listener.tsx`
  (`MailSSEListener`), mounted in `src/app/[locale]/(loggedin)/u/[account]/[folder]/layout.tsx`.
  It passes the current `folderPath` (from `useCurrentFolder`) and translated
  fallbacks (`MAILS_COMMONS` keys `sse.defaultSubject.string`, `sse.defaultSender.string`).
- Hook signature:

  ```ts
  useMailReceivedListener(
    folder: string = 'INBOX',
    params?: Record<string, string | number | boolean>,
    fallbacks?: MailReceivedListenerFallbacks // { defaultSubject, defaultSenderName }
  )
  ```

- If `getSSEServiceInstance()` is still `null`, it retries every 10 s, up to 3 tries.
- The `mail:received` event data is JSON; if it has a `data` field, that field is
  used (`handleMailReceived` in `utils/message-handlers.ts`). Mapping to `ImapMessagesList`:

  | Event field                 | Mail field  | Fallback                   |
  | --------------------------- | ----------- | -------------------------- |
  | `id`                        | `id`        | `mail-${Date.now()}`        |
  | `subject`                   | `subject`   | `fallbacks.defaultSubject` |
  | `from.name` / `from.email`  | `from`      | `fallbacks.defaultSenderName` / `''` |
  | `receivedAt`                | `date`      | now (ISO)                  |
  | `preview`                   | `snippet`   | `''`                       |

  All other fields are fixed (`seen: false`, `flagged: false`, `priority: 3`, empty
  `to` and `mailType`, ...). The mail is prepended unless its id is already
  present, and `total` is incremented.

Example server event:

```
event: mail:received
id: 42
data: {"id":"42","subject":"Hello","from":{"name":"Ann","email":"ann@example.com"},"receivedAt":"2026-01-01T10:00:00Z","preview":"Hi..."}
```

Minimal usage in a component (this is all `MailSSEListener` does):

```tsx
useMailReceivedListener(folderPath, undefined, fallbacks)
```

## Fake endpoint

`src/app/fakeApi/sse/route.ts` answers `GET /fakeApi/sse` with a single unnamed
event `data: {"type":"ping"}` and then ends the response. It only avoids a 404
when the API base URL points to the fake API; it never sends `mail:received`.
The browser then sees the stream close and reconnects.

## Logout

`src/lib/redux/listeners/reset-cache-on-logout.ts`, on `logout`, calls
`getSSEServiceInstance()?.disconnect()`. `clearAuthenticatedApiCache()` (called
after the authenticated tree unmounts) also dispatches
`sseApi.util.resetApiState()`. On the next login the layout effect calls
`connect(config)` again, which creates a new `SSEService`.

## Adding a new event type

1. In `SSEService.connect()`, add `this.eventSource.addEventListener('<name>', ...)`
   with a private handler that updates `lastMessageTime` / `messageCount`, calls
   `resetHeartbeat()` and `this.emitMessage('<name>', message)`. Named events are
   not delivered to the generic `message` listener.
2. Add a parser next to `handleMailReceived` in `utils/message-handlers.ts` and
   export it from `utils/index.ts`.
3. Write a hook modelled on `useMailReceivedListener`: get the service with
   `getSSEServiceInstance()`, call `subscribe('<name>', handler)`, return the
   unsubscribe function from the effect, and update the RTK Query cache with
   `updateQueryData` using the **exact** query argument the consuming component uses.
4. Mount it in the layout of the screen that needs it, and add tests under
   `src/lib/redux/sse/hooks/__tests__/`.

## Known limitations

- Only `mail:received` is handled. `handleDataEvent` / `handlePing` exist in
  `SSEService` but are never registered; unnamed events are emitted as `message`
  and nobody subscribes to them.
- Reconnect limits are hardcoded and inconsistent: `handleError` stops after 3
  attempts, `attemptReconnect` caps at 13, and the logs say 3. The configured
  `maxReconnectAttempts` is never read. Delay is `reconnectInterval * attempt`.
- `withCredentials` and `headers` in `SSEConfig` have no effect: `EventSource` is
  created with the URL only and cannot send custom headers, so the
  `Authorization` header in `getProductionSSEConfig()` is ignored. Auth must come
  from cookies or the URL.
- `SSEService.connect()` calls `new URL(config.url)`, which throws for a relative
  URL such as `/fakeApi/sse`; the error goes to the reconnect path.
- Two singletons exist: `sseServiceInstance` in `sse-api.ts` (used by the app)
  and `sseService` in `sse-service.ts` (`getSSEService`, `initializeSSEService`,
  `resetSSEService`), which nothing in the app uses.
- `useSubscribeToEventsQuery` is a stub whose `queryFn` returns `[]`; no code
  writes to it.
- The listener updates `updateQueryData('getFolderMessages', { folder, params })`
  without `accountId`, while the list (`use-folder-messages.ts`) subscribes with
  `{ folder, accountId, params }` (and `MailSSEListener` passes `params`
  as `undefined`). The cache keys differ, so new mails most
  likely never reach the displayed list. A fix is planned separately.
