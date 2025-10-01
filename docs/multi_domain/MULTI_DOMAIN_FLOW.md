# Multi-Domain Routing Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Check Domain   │
                    └───────┬────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
   ┌────────────────┐              ┌────────────────┐
   │ Admin Domain?  │              │  User Domain   │
   │ (from env var) │              │  (all others)  │
   └────────┬───────┘              └────────┬───────┘
            │                               │
            ▼                               ▼
   ┌────────────────┐              ┌────────────────┐
   │  Is Auth Path? │              │  Is Auth Path? │
   │  /auth/login   │              │  /auth/login   │
   └────────┬───────┘              └────────┬───────┘
            │                               │
     ┌──────┴──────┐                 ┌──────┴──────┐
     │             │                 │             │
     ▼             ▼                 ▼             ▼
   ✅ Yes        ❌ No              ✅ Yes        ❌ No
   Allow       Check               Allow       Check
     │         Path                  │         Path
     │           │                   │           │
     │           ▼                   │           ▼
     │    ┌─────────────┐            │    ┌──────────────┐
     │    │ /admin_panel│            │    │ /admin_panel?│
     │    │    path?    │            │    └──────┬───────┘
     │    └──────┬──────┘            │           │
     │           │                   │    ┌──────┴──────┐
     │    ┌──────┴──────┐            │    │             │
     │    │             │            │    ▼             ▼
     │    ▼             ▼            │  ✅ Yes        ❌ No
     │  ✅ Yes        ❌ No          │  Redirect     Allow
     │  Allow      Redirect          │  to /          │
     │             to /admin_panel   │                │
     │                               │                │
     └───────────┬───────────────────┴────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │   Serve Page │
         └──────────────┘
```

## Route Decision Table

### Admin Domain Requests

```
Request Path              Auth?   Admin Panel?   Action
────────────────────────  ──────  ─────────────  ─────────────────────
/en                       No      No             → Redirect /en/admin_panel
/en/admin_panel           No      Yes            → ✅ Allow
/en/u/john                No      No             → Redirect /en/admin_panel
/en/address_books         No      No             → Redirect /en/admin_panel
/en/user_settings         No      No             → Redirect /en/admin_panel
/en/auth/login            Yes     No             → ✅ Allow
/en/auth/signup           Yes     No             → ✅ Allow
```

### User Domain Requests

```
Request Path              Auth?   Admin Panel?   Action
────────────────────────  ──────  ─────────────  ─────────────────────
/en                       No      No             → ✅ Allow
/en/admin_panel           No      Yes            → Redirect /en
/en/u/john                No      No             → ✅ Allow
/en/address_books         No      No             → ✅ Allow
/en/user_settings         No      No             → ✅ Allow
/en/auth/login            Yes     No             → ✅ Allow
/en/auth/signup           Yes     No             → ✅ Allow
```

## Key Implementation Details

### 1. Domain Detection

```typescript
isAdminDomain(hostname: string): boolean
// Checks if hostname matches any in NEXT_PUBLIC_ADMIN_DOMAINS
```

### 2. Path Type Detection

```typescript
isAdminPanelPath(pathname: string): boolean
// Returns true only for /[locale]/admin_panel

isAuthPath(pathname: string): boolean
// Returns true for /[locale]/auth/*

isLocaleRootPath(pathname: string): boolean
// Returns true for /[locale] or /[locale]/
```

### 3. Redirect Logic

- **Admin domain, non-auth, non-admin path** → Redirect to `/[locale]/admin_panel`
- **User domain, admin path** → Redirect to `/[locale]`
- **Auth paths** → Always allowed on both domains

## Benefits

✅ **Security**: Admin panel isolated to specific domains  
✅ **Simplicity**: Single codebase, multiple access points  
✅ **Flexibility**: Shared authentication across domains  
✅ **Scalability**: Easy to add more admin domains  
✅ **User Experience**: Clean domain separation
