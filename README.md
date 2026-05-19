# ORVIX — Creator Operating System

> The cinematic creator OS. From prompt to viral reel in 60 seconds.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS |
| Motion | Framer Motion, GSAP |
| State | Zustand, TanStack Query |
| Auth | Clerk |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Cache | Redis (Upstash) |
| Storage | Cloudflare R2 |
| AI | OpenAI, Claude, Gemini, ElevenLabs, Stability AI |
| Payments | Stripe + Razorpay |
| Deployment | Vercel + Railway |
| CI/CD | GitHub Actions |

---

## Local Development

### 1. Clone the repository
```bash
git clone https://github.com/your-org/orvix.git
cd orvix
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up the database
```bash
# Push schema to Supabase
npx prisma db push

# Or run migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Open Prisma Studio (optional)
npx prisma studio
```

### 4. Start development server
```bash
npm run dev
# App runs at http://localhost:3000
```

---

## Project Structure

```
orvix/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (landing)/          # Public landing page
│   │   ├── (auth)/             # Login, Register
│   │   ├── (dashboard)/        # Protected app
│   │   │   ├── studio/         # AI Video Studio
│   │   │   ├── editor/         # Video Editor
│   │   │   ├── analytics/      # Analytics Dashboard
│   │   │   ├── scheduler/      # Content Scheduler
│   │   │   ├── library/        # Asset Library
│   │   │   ├── team/           # Team Management
│   │   │   ├── billing/        # Billing & Credits
│   │   │   └── settings/       # User Settings
│   │   └── api/                # API Routes
│   │       ├── videos/         # Video CRUD + Generation
│   │       ├── scripts/        # Script Generation
│   │       ├── credits/        # Credit Management
│   │       ├── trends/         # Trend Scanner
│   │       ├── publish/        # Social Publishing
│   │       ├── auth/           # Auth webhooks
│   │       └── webhooks/       # Stripe, Clerk webhooks
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Nav, Sidebar, Footer
│   │   ├── studio/             # Studio components
│   │   ├── editor/             # Editor components
│   │   ├── analytics/          # Analytics components
│   │   └── landing/            # Landing page sections
│   ├── lib/
│   │   ├── ai.ts               # AI service layer
│   │   ├── prisma.ts           # Prisma client
│   │   ├── supabase.ts         # Supabase client
│   │   ├── stripe.ts           # Stripe client
│   │   ├── redis.ts            # Redis client
│   │   ├── queue.ts            # Job queue (Bull)
│   │   ├── storage.ts          # R2 storage
│   │   ├── credits.ts          # Credit system
│   │   ├── analytics.ts        # Analytics helpers
│   │   ├── hooks/              # Custom React hooks
│   │   └── stores/             # Zustand stores
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global CSS
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── vercel.json                 # Vercel config
├── next.config.js              # Next.js config
└── tailwind.config.js          # Tailwind config
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add all environment variables from `.env.example`
4. Deploy

The GitHub Actions pipeline will automatically:
- Run type checks and linting
- Build the application
- Run database migrations
- Deploy to Vercel production

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Environment Variables

See `.env.example` for the full list. Critical ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection |
| `CLERK_SECRET_KEY` | Authentication |
| `OPENAI_API_KEY` | GPT-4o for scripts + analysis |
| `ANTHROPIC_API_KEY` | Claude for deep content analysis |
| `ELEVENLABS_API_KEY` | Voice synthesis |
| `STRIPE_SECRET_KEY` | Payment processing |
| `CLOUDFLARE_R2_*` | Media storage |

---

## Credit System

| Action | Credits |
|--------|---------|
| AI Script | 5 |
| AI Reel 720p | 30 |
| AI Reel 1080p | 40 |
| AI Reel 4K | 80 |
| HD Export | 20 |
| 4K Export | 60 |
| Viral Analysis | 15 |
| Voice Clone | 50 |
| Trend Scan | 10 |
| AI Thumbnail | 8 |

### Plans
| Plan | Monthly Credits | Price |
|------|----------------|-------|
| Free | 50 | $0 |
| Pro | 2,000 | $9.99/mo |
| Elite | 10,000 | $49/mo |

---

## API Reference

### Generate Video
```http
POST /api/videos/generate
Authorization: Bearer <clerk_token>

{
  "prompt": "5 AI tools replacing designers in 2025",
  "platform": "TIKTOK",
  "resolution": "1080p",
  "captionStyle": "cinematic",
  "duration": 60
}
```

### Get Videos
```http
GET /api/videos?page=1&pageSize=20&status=READY
Authorization: Bearer <clerk_token>
```

### Generate Script
```http
POST /api/scripts/generate
Authorization: Bearer <clerk_token>

{
  "topic": "AI side hustle guide",
  "platform": "YOUTUBE",
  "framework": "hook-story-cta"
}
```

---

## Architecture Decisions

**Why Supabase + Prisma?**
Supabase gives us managed PostgreSQL + realtime capabilities + Storage. Prisma gives us type-safe ORM with migrations.

**Why Clerk?**
Best-in-class auth with Google, Apple, magic links, and webhooks. Handles all auth complexity out of the box.

**Why Claude + OpenAI?**
Claude excels at creative writing and nuanced content strategy. GPT-4o excels at structured JSON output and analysis. We route tasks to the optimal model.

**Why Bull for queues?**
Video rendering is async and CPU-heavy. Bull on Redis gives us reliable job queues with progress tracking, retries, and priority.

**Why Cloudflare R2?**
Zero egress fees for media. This is critical at scale — video storage/delivery costs can 10x without R2.

---

## License

Proprietary — ORVIX, Inc. All rights reserved.
