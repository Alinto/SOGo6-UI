## Requirements

- VSCode (https://code.visualstudio.com/download)
- Devcontainer VSCode extension

## Getting Started

First of all open the folder as devcontainer

Install dependancies

```bash
npm i
```

Start the dev server

```bash
npm run dev
```

## Multi-Domain Configuration

This application supports domain-based routing, allowing you to:

- Access the admin panel from a dedicated admin domain
- Access regular user features from a different domain

### Setup

1. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

2. Configure your admin domain(s) in `.env.local`:

```bash
NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost,admin.example.com
```

### How It Works

- **Admin Domain**: When accessing from a domain listed in `NEXT_PUBLIC_ADMIN_DOMAINS`:
  - **EXCLUSIVELY** allows access to `/admin_panel` only
  - ALL other routes (except login) automatically redirect to `/admin_panel`
  - Root path redirects to `/admin_panel`
- **User Domain**: When accessing from other domains:
  - All routes are accessible EXCEPT `/admin_panel`
  - Attempts to access `/admin_panel` redirect to the home page
- **Login Page**: The `/auth/login` route is accessible from both domains

### Local Development

For local testing with multiple domains, update your `/etc/hosts` file:

```bash
127.0.0.1 localhost
127.0.0.1 admin.localhost
```

Then access:

- User interface: http://localhost:3000
- Admin interface: http://admin.localhost:3000

##

## Transifex

## Stack

- NextJS
- Typescript
- Eslint
- React Redux
- Redux Toolkit (RTK)
- TailwindCSS
- Shadcn (UI Components based on Radix UI)
- React Hook Form
- Zod (Forms validation)
- Next Intl (i18n)
- Storybook
- Jest
- Testing library react
