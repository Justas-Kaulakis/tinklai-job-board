This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Local development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Run with Docker Compose

If you prefer running the project inside Docker (e.g. on a virtual machine), a production-ready setup is available:

```bash
docker compose up --build
```

This command starts two containers:

- `db`: PostgreSQL database seeded with demo data (user/password: `justas`/`justas`).
- `web`: Next.js application served in production mode on [http://localhost:3000](http://localhost:3000).

Environment variables from `.env` are automatically loaded. The database URL is overridden in `docker-compose.yml` to point at the `db` service. By default the database is re-seeded on every container start (data is reset); set `AUTO_DB_SEED=false` in the `web` service environment to skip this step.

Uploaded files are stored in a named Docker volume (`uploads`) so that images survive container restarts.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```git

app/
│
├─ layout.tsx                          → Root layout (global <html>, <body>, <Header/>)
│
├─ (public)/                           → Publicly visible pages
│   ├─ layout.tsx                      → Optional (for public navbar/footer)
│   ├─ page.tsx                        → Homepage showing all job posts
│   ├─ jobs/
│   │   ├─ page.tsx                    → List of all jobs (OFFER / WANTED)
│   │   └─ [id]/page.tsx               → Job details + "Send Message" form
│   ├─ about/page.tsx
│   └─ contact/page.tsx
│
├─ (auth)/                             → Authentication pages (no need for navbar)
│   ├─ layout.tsx                      → Simple auth container (centered form layout)
│   ├─ sign-in/page.tsx
│   └─ sign-up/page.tsx
│
├─ dashboard/                          → User's private area
│   ├─ layout.tsx                      → Dashboard sidebar/topbar layout
│   ├─ page.tsx                        → Overview (user’s posts + messages summary)
│   └─ posts/
│       ├─ page.tsx                    → List user's own posts
│       ├─ new/page.tsx                → Create new job post
│       └─ [id]/edit/page.tsx          → Edit user's own post
│
├─ controller/                         → Moderation area
│   ├─ layout.tsx                      → Controller dashboard layout
│   ├─ page.tsx                        → Overview: all posts (filter, moderation actions)
│   └─ posts/[id]/page.tsx             → Review a specific post (with delete option)
│
├─ admin/                              → Admin area
│   ├─ layout.tsx                      → Admin dashboard layout
│   ├─ page.tsx                        → Overview: user stats or summary
│   └─ users/
│       ├─ page.tsx                    → List all users
│       └─ [id]/edit/page.tsx          → Manage single user (role / canPost toggle)
│
└─ api/
    ├─ jobs/
    │   ├─ route.ts                    → GET (public), POST (requires canPost)
    │   └─ [id]/route.ts               → GET, PATCH, DELETE (owner/admin)
    ├─ messages/
    │   ├─ route.ts                    → POST (send message)
    │   └─ received/route.ts           → GET (messages for posts user owns)
    └─ users/
        └─ route.ts                    → Admin-only endpoints (grant/revoke rights)

```

| Layout                  | Purpose                                                            | Contains                                                                                              |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`        | Global layout                                                      | `<html>`, `<body>`, global `<Header />` & `<Footer />`, and shared styling (Tailwind containers etc.) |
| `(public)/layout.tsx`   | Optional – only if you want a *different* navbar/footer for guests | Public navbar, maybe no “Dashboard” button                                                            |
| `(auth)/layout.tsx`     | Simplified centered form layout                                    | e.g. `<main className="flex min-h-screen items-center justify-center">`                               |
| `dashboard/layout.tsx`  | Private user dashboard layout                                      | Sidebar (Posts, Messages, Settings) + topbar                                                          |
| `controller/layout.tsx` | Moderator view layout                                              | Simplified dashboard with moderation panel                                                            |
| `admin/layout.tsx`      | Admin panel layout                                                 | Sidebar (Users, Roles, Stats) + heading                                                               |
