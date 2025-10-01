# Multi-Domain Configuration - Quick Reference

## Summary

Your SOGo application now supports **exclusive domain-based routing** for the admin panel.

## Configuration

Add to `.env.local`:

```bash
NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost,admin.example.com
```

## Behavior

### Admin Domain (`admin.example.com`)

✅ **Allowed:**

- `/[locale]/admin_panel` - Admin panel interface
- `/[locale]/auth/login` - Login page (shared)
- `/[locale]/auth/*` - All auth routes

❌ **Blocked (redirects to `/admin_panel`):**

- `/[locale]` - Root path
- `/[locale]/u/*` - User pages
- `/[locale]/address_books` - Address books
- `/[locale]/user_settings` - User settings
- All other user routes

### User Domain (`app.example.com` or any non-admin domain)

✅ **Allowed:**

- `/[locale]` - Home page
- `/[locale]/u/*` - User pages
- `/[locale]/address_books` - Address books
- `/[locale]/user_settings` - User settings
- `/[locale]/auth/*` - All auth routes
- All routes except admin_panel

❌ **Blocked (redirects to `/`):**

- `/[locale]/admin_panel` - Admin panel

## Local Development Testing

1. Add to `/etc/hosts`:

```
127.0.0.1 admin.localhost
```

2. Start dev server:

```bash
npm run dev
```

3. Test URLs:
   - Admin: http://admin.localhost:3000
   - User: http://localhost:3000
   - Login works on both!

## Real-World Example

```bash
# Production setup
NEXT_PUBLIC_ADMIN_DOMAINS=admin.sogo.com,manage.sogo.com

# Now:
# - https://admin.sogo.com → Only admin_panel accessible
# - https://app.sogo.com → All user features accessible
# - Both domains share the same login page
```

## Key Points

1. **Exclusive Access**: Admin domain can ONLY access `/admin_panel`
2. **Shared Authentication**: Login page works on both domains
3. **Automatic Redirects**: Invalid routes automatically redirect to appropriate pages
4. **No Manual Routing**: Middleware handles everything automatically

## Need Help?

See the full documentation in `docs/MULTI_DOMAIN_SETUP.md`
