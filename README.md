# Setu

The bridge between juniors and seniors. Post a doubt about anything - academics, music, sport, hostel life - seniors and peers answer, the community scores every answer, the best advice rises.

## Stack

- Next.js 16 + TypeScript + Tailwind (custom design system)
- Framer Motion
- Supabase (Postgres, auth, row-level security, realtime notifications)
- Vercel hosting, PWA-installable

## Local dev

```bash
npm install
npm run dev
```

Without Supabase env vars the app renders with the built-in demo community (`src/lib/demo.ts`). To connect a live backend, create a Supabase project, run `supabase/schema.sql` in its SQL editor, then set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Database

`supabase/schema.sql` - tables, RLS policies, scoring views, the below-2-stars 7-day advice cooldown (enforced at the database level), and notification fan-out triggers.

## Author

Aditya Kulkarni - https://github.com/Aditya2375