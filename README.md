# PushUpTracker

Team workout tracker for push-ups and other bodyweight exercises. Create a room, invite participants with a code, record workouts, and follow progress on a shared leaderboard.

## Features

- Email registration and login
- Password reset flow
- Room creation and join by invite code
- Participant profile
- Room leaderboard
- Workout session tracking
- Camera-based exercise flow powered by MediaPipe Pose
- Mobile-friendly PWA installability
- Health check endpoint for deployment monitoring

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL
- Supabase Auth
- MediaPipe Tasks Vision
- Playwright
- Docker

## Getting Started

```bash
git clone https://github.com/buluktaev/PushUpTracker.git
cd PushUpTracker
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env` from `.env.example` and configure:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
APP_PUBLIC_URL=http://localhost:3000
ADMIN_API_KEY=change-me
NEXT_PUBLIC_ENABLE_REVIEW_ROUTES=false
```

`DATABASE_URL` is used by Prisma CLI through `prisma.config.ts`. The runtime Prisma client is configured in `lib/prisma.ts` with `@prisma/adapter-pg`.

## Scripts

```bash
npm run dev
npm run dev:next
npm run typecheck
npm run lint
npm run build
npm run preprod:static
npm run smoke:health
npm run smoke:browser
npm run smoke:browser:headed
npm run studio:test
```

Recommended checks before deployment:

```bash
npm run preprod:static
npm run smoke:health
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Home and room entry |
| `/login` | Login |
| `/register` | Registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Set a new password |
| `/verify-email` | Email verification |
| `/room/[code]` | Room leaderboard and workout flow |
| `/api/health` | Health check |

Optional review routes can be enabled with `NEXT_PUBLIC_ENABLE_REVIEW_ROUTES=true`:

| Route | Description |
| --- | --- |
| `/components` | Component review surface |
| `/screens` | Screen review surface |
| `/design-preview` | Extended design preview |

Disable review routes in production unless they are intentionally exposed.

## Deployment

The app is configured for Docker-based deployment. Render service configuration is stored in `render.yaml`.

Health check:

```bash
curl -I "$APP_PUBLIC_URL/api/health"
```

Expected result: HTTP `200`.

## Project Structure

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router pages and API routes |
| `components/` | UI and workout components |
| `hooks/` | Client hooks |
| `lib/` | Server/client utilities |
| `prisma/` | Prisma schema and migrations |
| `public/` | Static assets and MediaPipe files |
| `scripts/` | Local and deployment helper scripts |
| `tests/smoke/` | Playwright smoke tests |

## License

Private project. No license is currently provided.
