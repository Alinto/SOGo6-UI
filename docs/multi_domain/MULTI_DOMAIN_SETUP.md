# Multi-Domain Setup Guide

## Overview

This guide explains how to configure and use the multi-domain feature that allows separate domains for admin and user access.

## Configuration

### Environment Variables

Set the `NEXT_PUBLIC_ADMIN_DOMAINS` environment variable to specify which domains should have access to the admin panel:

```bash
# Single domain
NEXT_PUBLIC_ADMIN_DOMAINS=admin.example.com

# Multiple domains (comma-separated)
NEXT_PUBLIC_ADMIN_DOMAINS=admin.example.com,admin2.example.com,manage.example.com
```

### Domain Routing Logic

The proxy (`src/proxy.ts`) implements the following rules:

1. **Authentication Routes** (`/[locale]/auth/*`)
   - Accessible from ALL domains
   - Includes login, signup, password reset, etc.

2. **Admin Domain Behavior** (domains listed in `NEXT_PUBLIC_ADMIN_DOMAINS`)
   - **EXCLUSIVELY** allows access to `/[locale]/admin_panel` only
   - ALL other routes (except auth) are automatically redirected to `/[locale]/admin_panel`
   - Root path (`/[locale]`) redirects to `/[locale]/admin_panel`

3. **User Domain Behavior** (all other domains)
   - Accessible to all routes EXCEPT `/[locale]/admin_panel`
   - Attempts to access `/[locale]/admin_panel` are redirected to the home page

## Deployment Examples

### Nginx Configuration

```nginx
# User domain
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Admin domain
server {
    listen 80;
    server_name admin.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_ADMIN_DOMAINS=admin.example.com,admin.yourdomain.com
```

### Vercel

Add the environment variable in your project settings:

- Go to Project Settings → Environment Variables
- Add `NEXT_PUBLIC_ADMIN_DOMAINS` with your admin domain(s)

## Testing

### Local Development

1. Edit `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 localhost
127.0.0.1 admin.localhost
```

2. Start the development server:

```bash
npm run dev
```

3. Test the domains:
   - User interface: http://localhost:3000
   - Admin interface: http://admin.localhost:3000
   - Login (both): http://localhost:3000/en/auth/login or http://admin.localhost:3000/en/auth/login

### Expected Behavior

| Domain            | Route               | Result                            |
| ----------------- | ------------------- | --------------------------------- |
| admin.example.com | `/en/admin_panel`   | ✅ Accessible                     |
| admin.example.com | `/en`               | ❌ Redirects to `/en/admin_panel` |
| admin.example.com | `/en/u/john`        | ❌ Redirects to `/en/admin_panel` |
| admin.example.com | `/en/address_books` | ❌ Redirects to `/en/admin_panel` |
| admin.example.com | `/en/user_settings` | ❌ Redirects to `/en/admin_panel` |
| admin.example.com | `/en/auth/login`    | ✅ Accessible                     |
| app.example.com   | `/en/admin_panel`   | ❌ Redirects to `/en`             |
| app.example.com   | `/en`               | ✅ Accessible                     |
| app.example.com   | `/en/u/john`        | ✅ Accessible                     |
| app.example.com   | `/en/address_books` | ✅ Accessible                     |
| app.example.com   | `/en/auth/login`    | ✅ Accessible                     |

## Customization

### Allowing Additional Routes on Admin Domain

By default, the admin domain ONLY allows access to `/admin_panel`. If you need to allow additional routes on the admin domain, you can modify the proxy logic:

**Option 1**: Allow specific routes by editing the `isAdminPanelPath` function in `src/proxy.ts`:

```typescript
export function isAdminPanelPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  // Add additional allowed routes for admin domain
  const adminPathRegex = new RegExp(
    `^/(${localePattern})/(admin_panel|administration)(/|$)`
  )
  return adminPathRegex.test(pathname)
}
```

**Option 2**: Create a whitelist of allowed paths in the handler function to allow specific routes without redirecting.

### Adding More Auth Routes

To include additional routes that should be accessible from both domains, modify the `isAuthPath` function:

```typescript
export function isAuthPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  // Add routes that should be accessible from both domains
  const authPathRegex = new RegExp(
    `^/(${localePattern})/(auth|public-page)(/|$)`
  )
  return authPathRegex.test(pathname)
}
```

## Troubleshooting

### Issue: Redirects not working

**Solution**: Ensure the `NEXT_PUBLIC_ADMIN_DOMAINS` environment variable is set correctly and the application is restarted.

### Issue: Can't access admin panel

**Solution**:

1. Check that you're accessing from the correct domain
2. Verify the domain is listed in `NEXT_PUBLIC_ADMIN_DOMAINS`
3. Check the browser console for any proxy errors

### Issue: Infinite redirect loop

**Solution**:

1. Ensure your admin routes match the patterns in `isAdminPath`
2. Check that your auth routes match the patterns in `isAuthPath`
3. Clear browser cache and cookies

## Security Considerations

1. **Domain Verification**: The proxy checks the `Host` header, which can be spoofed. For production, consider additional verification.

2. **Authentication**: This feature handles routing only. Ensure proper authentication checks are in place in your components and API routes.

3. **HTTPS**: Always use HTTPS in production to prevent man-in-the-middle attacks.

4. **Environment Variables**: Never commit `.env.local` or production environment variables to version control.
