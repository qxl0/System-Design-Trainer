# System Design Interview Trainer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js 14 web app for practicing system design interviews with AI evaluation and spaced repetition.

**Architecture:** Next.js 14 App Router with TypeScript; Prisma + SQLite for local persistence; OpenAI GPT-4o for structured JSON feedback; SM-2 algorithm for spaced repetition scheduling.

**Tech Stack:** Next.js 14, TypeScript, Prisma, SQLite, OpenAI SDK, Tailwind CSS, Jest, React Testing Library

---

## File Map

```
src/
  app/
    layout.tsx                    # Root layout + nav
    page.tsx                      # Home — filterable question list
    practice/
      [id]/
        page.tsx                  # Timed answer editor
        feedback/
          page.tsx                # AI feedback + model answer
    progress/
      page.tsx                    # Stats dashboard
    api/
      questions/
        route.ts                  # GET /api/questions
        [id]/
          route.ts                # GET /api/questions/[id]
      sessions/
        route.ts                  # POST /api/sessions
      evaluate/
        route.ts                  # POST /api/evaluate
      progress/
        route.ts                  # GET /api/progress
        [id]/
          route.ts                # PATCH /api/progress/[id]
  components/
    FilterBar.tsx                 # Difficulty/category/status filters
    QuestionRow.tsx               # Single row in question list
    Timer.tsx                     # Countdown timer
  lib/
    sm2.ts                        # SM-2 algorithm
    openai.ts                     # OpenAI evaluation client
    prisma.ts                     # Prisma client singleton
  types/
    index.ts                      # Shared TypeScript types
prisma/
  schema.prisma
  seed.ts
data/
  questions.ts                    # ~50 curated questions
__tests__/
  lib/
    sm2.test.ts
    openai.test.ts
  components/
    FilterBar.test.tsx
    QuestionRow.test.tsx
    Timer.test.tsx
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `jest.config.ts`, `jest.setup.ts`, `.env.local.example`, `.gitignore`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd C:/Users/qiang/source/repos/SystemDesign
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @prisma/client openai
npm install -D prisma jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

- [ ] **Step 3: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 4: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Create `.env.local.example`**

```
OPENAI_API_KEY=sk-...
```

- [ ] **Step 6: Create `.env.local`** (add your real key)

```
OPENAI_API_KEY=sk-YOUR_KEY_HERE
```

- [ ] **Step 7: Add `.env.local` to `.gitignore`** (verify it's already there from create-next-app)

```bash
grep '.env.local' .gitignore
```

Expected: `.env.local` is listed.

- [ ] **Step 8: Verify Jest works**

```bash
npx jest --passWithNoTests
```

Expected: `Test Suites: 0 passed`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 14 project with Jest"
```

---

## Task 2: Prisma Schema + Migration

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (add seed script)

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Replace `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Question {
  id          String    @id @default(cuid())
  title       String
  prompt      String
  difficulty  String
  category    String
  tags        String
  modelAnswer String
  sessions    Session[]
  progress    Progress?
  createdAt   DateTime  @default(now())
}

model Session {
  id           String   @id @default(cuid())
  questionId   String
  question     Question @relation(fields: [questionId], references: [id])
  answer       String
  aiFeedback   String
  score        Int
  durationSecs Int
  createdAt    DateTime @default(now())
}

model Progress {
  id           String   @id @default(cuid())
  questionId   String   @unique
  question     Question @relation(fields: [questionId], references: [id])
  interval     Int      @default(1)
  easeFactor   Float    @default(2.5)
  nextReviewAt DateTime @default(now())
  lastScore    Int?
  updatedAt    DateTime @updatedAt
}
```

- [ ] **Step 3: Add `DATABASE_URL` to `.env` (Prisma default)**

```
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 4: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 5: Add seed script to `package.json`**

Add inside the existing `"scripts"` object:
```json
"db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
"db:reset": "npx prisma migrate reset --force && npm run db:seed"
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ .env package.json
git commit -m "feat: add Prisma schema with Question, Session, Progress models"
```

---

## Task 3: Shared TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Category =
  | 'Scalability'
  | 'Storage'
  | 'Caching'
  | 'Messaging'
  | 'Search'
  | 'Real-time'
  | 'Infrastructure'
  | 'URL/ID'

export interface Question {
  id: string
  title: string
  prompt: string
  difficulty: Difficulty
  category: Category
  tags: string[]
  modelAnswer: string
  createdAt: string
}

export interface Session {
  id: string
  questionId: string
  answer: string
  aiFeedback: AiFeedback
  score: number
  durationSecs: number
  createdAt: string
}

export interface Progress {
  id: string
  questionId: string
  interval: number
  easeFactor: number
  nextReviewAt: string
  lastScore: number | null
  updatedAt: string
}

export interface AiFeedback {
  score: number
  strengths: string[]
  gaps: string[]
  tip: string
}

export type QuestionStatus = 'not_started' | 'done' | 'due'

export interface QuestionWithStatus extends Question {
  status: QuestionStatus
  nextReviewAt?: string
  lastScore?: number | null
}

export type SelfRating = 'Easy' | 'Hard'
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 4: SM-2 Algorithm (TDD)

**Files:**
- Create: `src/lib/sm2.ts`
- Create: `__tests__/lib/sm2.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/sm2.test.ts`:

```typescript
import { applySm2 } from '@/lib/sm2'

describe('applySm2', () => {
  const base = { interval: 1, easeFactor: 2.5 }

  it('Hard rating on first review: interval=1, easeFactor decreases', () => {
    const result = applySm2(base, 'Hard')
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBeCloseTo(2.18, 1)
  })

  it('Easy rating on first review: interval=3, easeFactor stays 2.5', () => {
    const result = applySm2(base, 'Easy')
    expect(result.interval).toBe(3)
    expect(result.easeFactor).toBeCloseTo(2.6, 1)
  })

  it('subsequent Easy: interval scales by easeFactor', () => {
    const prev = { interval: 3, easeFactor: 2.5 }
    const result = applySm2(prev, 'Easy')
    expect(result.interval).toBe(8) // round(3 * 2.5) = 8 (rounded)
  })

  it('easeFactor never drops below 1.3', () => {
    const low = { interval: 1, easeFactor: 1.3 }
    const result = applySm2(low, 'Hard')
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('nextReviewAt is in the future by interval days', () => {
    const before = Date.now()
    const result = applySm2(base, 'Easy')
    const after = Date.now()
    const reviewTime = new Date(result.nextReviewAt).getTime()
    expect(reviewTime).toBeGreaterThan(before + 2 * 24 * 60 * 60 * 1000)
    expect(reviewTime).toBeLessThan(after + 4 * 24 * 60 * 60 * 1000)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/lib/sm2.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/sm2'`

- [ ] **Step 3: Implement `src/lib/sm2.ts`**

```typescript
import type { SelfRating } from '@/types'

interface Sm2Input {
  interval: number
  easeFactor: number
}

interface Sm2Result {
  interval: number
  easeFactor: number
  nextReviewAt: string
}

export function applySm2(current: Sm2Input, rating: SelfRating): Sm2Result {
  const q = rating === 'Easy' ? 5 : 2
  const newEaseFactor = Math.max(
    1.3,
    current.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  )

  let newInterval: number
  if (current.interval <= 1) {
    newInterval = rating === 'Easy' ? 3 : 1
  } else {
    newInterval = Math.round(current.interval * newEaseFactor)
  }

  const nextReviewAt = new Date(
    Date.now() + newInterval * 24 * 60 * 60 * 1000
  ).toISOString()

  return { interval: newInterval, easeFactor: newEaseFactor, nextReviewAt }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/lib/sm2.test.ts --no-coverage
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/sm2.ts __tests__/lib/sm2.test.ts
git commit -m "feat: implement SM-2 spaced repetition algorithm with tests"
```

---

## Task 5: OpenAI Evaluation Client (TDD)

**Files:**
- Create: `src/lib/openai.ts`
- Create: `__tests__/lib/openai.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/openai.test.ts`:

```typescript
import { evaluateAnswer } from '@/lib/openai'

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    score: 7,
                    strengths: ['Clear API design'],
                    gaps: ['Missing cache layer'],
                    tip: 'Always mention Redis for read-heavy systems',
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  }
})

describe('evaluateAnswer', () => {
  it('returns parsed AiFeedback from OpenAI', async () => {
    const result = await evaluateAnswer({
      question: 'Design a URL Shortener',
      modelAnswer: 'Use Base62 hash...',
      userAnswer: 'I would use a hash function...',
    })

    expect(result.score).toBe(7)
    expect(result.strengths).toEqual(['Clear API design'])
    expect(result.gaps).toEqual(['Missing cache layer'])
    expect(result.tip).toBe('Always mention Redis for read-heavy systems')
  })

  it('throws if OpenAI returns invalid JSON', async () => {
    const OpenAI = require('openai').default
    OpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'not json' } }],
          }),
        },
      },
    }))

    await expect(
      evaluateAnswer({
        question: 'Design something',
        modelAnswer: 'Answer',
        userAnswer: 'My answer',
      })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npx jest __tests__/lib/openai.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/openai'`

- [ ] **Step 3: Implement `src/lib/openai.ts`**

```typescript
import OpenAI from 'openai'
import type { AiFeedback } from '@/types'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface EvaluateInput {
  question: string
  modelAnswer: string
  userAnswer: string
}

export async function evaluateAnswer(input: EvaluateInput): Promise<AiFeedback> {
  const systemPrompt = `You are a senior software engineer evaluating system design interview answers.
Evaluate based on: completeness, correctness, depth, and trade-off discussion.
Return ONLY valid JSON with this exact shape:
{"score": <1-10>, "strengths": [<strings>], "gaps": [<strings>], "tip": <string>}`

  const userPrompt = `Question: ${input.question}

Reference Answer: ${input.modelAnswer}

Candidate Answer: ${input.userAnswer}

Evaluate the candidate's answer against the reference.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No content from OpenAI')

  const parsed = JSON.parse(content) as AiFeedback
  if (
    typeof parsed.score !== 'number' ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.gaps) ||
    typeof parsed.tip !== 'string'
  ) {
    throw new Error('Invalid feedback shape from OpenAI')
  }

  return parsed
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npx jest __tests__/lib/openai.test.ts --no-coverage
```

Expected: PASS — 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/openai.ts __tests__/lib/openai.test.ts
git commit -m "feat: implement OpenAI evaluation client with tests"
```

---

## Task 6: Prisma Client Singleton

**Files:**
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Create `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "feat: add Prisma client singleton"
```

---

## Task 7: Question Bank Data

**Files:**
- Create: `data/questions.ts`

- [ ] **Step 1: Create `data/questions.ts`**

```typescript
import type { Difficulty, Category } from '@/types'

export interface QuestionSeed {
  title: string
  prompt: string
  difficulty: Difficulty
  category: Category
  tags: string[]
  modelAnswer: string
}

export const questions: QuestionSeed[] = [
  {
    title: 'Design a URL Shortener',
    prompt:
      'Design a service like bit.ly that takes long URLs and returns short aliases. The system must handle millions of URLs, provide fast redirects, and optionally track click analytics.',
    difficulty: 'Medium',
    category: 'URL/ID',
    tags: ['hashing', 'sql', 'redis', 'cdn'],
    modelAnswer: `## URL Shortener Design

### Requirements
- Functional: shorten URL, redirect short → original, analytics (optional)
- Non-functional: 100M URLs, <10ms redirect latency, 99.9% uptime

### API
- POST /shorten { url } → { shortUrl }
- GET /:key → 301/302 redirect

### Hash Service
- Generate 6-char Base62 key (62^6 = 56B unique keys)
- On collision: append counter, rehash
- Pre-generate key pool for high throughput

### Storage
- SQL (PostgreSQL): id, short_key, original_url, created_at, user_id
- Redis: short_key → original_url (hot keys, TTL 24h)
- Read path: Redis → DB on miss → populate cache

### Redirect
- 301 (Moved Permanently): browser caches, reduces server load, loses analytics
- 302 (Found): every request hits server, enables click counting
- Use 302 for analytics; 301 for read-heavy with no analytics

### Scale
- Read:Write = 100:1 → cache aggressively
- Shard DB by short_key hash
- CDN in front for popular links`,
  },
  {
    title: 'Design a Unique ID Generator',
    prompt:
      'Design a distributed system that generates globally unique IDs at high throughput. IDs should be sortable by time and work across multiple data centers.',
    difficulty: 'Medium',
    category: 'URL/ID',
    tags: ['distributed', 'snowflake', 'uuid'],
    modelAnswer: `## Unique ID Generator

### Requirements
- Globally unique, ~64-bit integer
- Sortable by generation time
- 10K+ IDs/sec per node

### Approach: Twitter Snowflake
- 1 bit: sign (always 0)
- 41 bits: millisecond timestamp (69 years from epoch)
- 10 bits: machine ID (1024 nodes)
- 12 bits: sequence number per ms (4096/ms/node)

### Implementation
- Each node knows its machine ID at startup (from ZooKeeper or config)
- Sequence resets to 0 each millisecond
- On overflow (>4096/ms): wait for next ms

### Clock Skew
- Problem: NTP sync can move clock backward
- Solution: refuse to generate IDs if current time < last timestamp; alert ops

### Alternatives
- UUID v4: random, not sortable, 128 bits
- Database auto-increment: single point of failure
- Redis INCR: network hop per ID

### Trade-offs
- Snowflake: fast, sortable, no network hop — requires clock sync
- UUID: simple, no coordination — not sortable`,
  },
  {
    title: 'Design Twitter Feed',
    prompt:
      'Design the Twitter home feed — when a user opens Twitter, they see a ranked list of tweets from accounts they follow. The system must handle celebrity accounts (millions of followers) and deliver feeds in under 200ms.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['fanout', 'redis', 'kafka', 'cdn', 'ranking'],
    modelAnswer: `## Twitter Feed Design

### Requirements
- Home timeline: tweets from followed accounts, reverse-chronological + ranked
- 300M DAU, 500M tweets/day
- Read latency < 200ms

### Fan-out Approaches

**Fan-out on Write (push model)**
- On tweet: write to every follower's feed cache (Redis sorted set)
- Read: O(1) — just read from cache
- Problem: celebrity with 10M followers = 10M writes per tweet

**Fan-out on Read (pull model)**
- On read: fetch tweets from all followed accounts, merge, rank
- Problem: O(following_count) reads per page load

**Hybrid (Twitter's actual approach)**
- Normal users (<10K followers): fan-out on write
- Celebrities: fan-out on read (fetched and merged at read time)
- Threshold: configurable per account

### Storage
- Tweets: Cassandra (write-heavy, time-series, append-only)
- Feed cache: Redis sorted set (score = timestamp, value = tweet_id)
- User graph: MySQL (follower/following relationships)

### Ranking
- Fetch top-N from cache → apply ML ranking → return page
- Ranking considers: recency, engagement, relationship strength

### Media
- Images/video: S3 + CloudFront CDN
- Tweet contains media_url, not binary`,
  },
  {
    title: 'Design Instagram',
    prompt:
      'Design a photo-sharing social network like Instagram. Users upload photos, follow others, and see a feed of recent photos from accounts they follow.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['cdn', 'sql', 'cassandra', 'redis', 'fanout'],
    modelAnswer: `## Instagram Design

### Core Features
- Upload photo with caption
- Follow users
- Home feed (followed accounts, ranked)
- Profile page

### Photo Upload Flow
1. Client → API server: POST /photos (multipart)
2. API server → S3: store original
3. Background worker: resize to multiple resolutions (thumbnail, medium, full)
4. Store resized versions in S3, record URLs in DB
5. Fan-out tweet to followers' feeds

### Storage
- Photos: S3 + CloudFront CDN (serve closest edge)
- Metadata (caption, user_id, timestamp): PostgreSQL
- Social graph: PostgreSQL (user_id, follower_id, created_at)
- Feed cache: Redis sorted set per user

### Feed Generation
- Hybrid fan-out (same as Twitter): push for regular users, pull for celebrities
- Feed entry contains photo_id only; full data fetched on render

### Key Numbers
- 1B users, 95M photos/day
- Read:Write ≈ 100:1
- Photo storage: 95M × 3MB avg = 285TB/day → use S3 lifecycle policies

### CDN Strategy
- CloudFront origin = S3
- Cache-Control: max-age=31536000 (photos are immutable)
- Serve user's closest PoP`,
  },
  {
    title: 'Design TikTok / YouTube Shorts Feed',
    prompt:
      'Design a short-video feed that auto-plays the next video as the user scrolls. The recommendation engine must personalize the feed based on watch history and engagement signals.',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['cdn', 'ml', 'streaming', 'kafka', 'redis'],
    modelAnswer: `## Short Video Feed Design

### Components
1. Upload pipeline
2. Video storage + CDN delivery
3. Recommendation engine
4. Feed API

### Upload Pipeline
1. POST /videos → S3 raw storage
2. Transcoding job: FFmpeg → multiple resolutions (240p, 480p, 1080p) + HLS segments
3. Store HLS manifest + segments in S3
4. CDN (CloudFront) serves segments

### Video Delivery
- HLS (HTTP Live Streaming): adaptive bitrate based on network speed
- Preload next 2 videos while current plays
- CDN cache: segments cached at edge, TTL = forever (immutable)

### Recommendation Engine
- Input signals: watch time %, likes, shares, skips, account follows
- Emit events to Kafka on each signal
- Flink processes events → update user embedding + video embedding
- ANN search (FAISS): find top-K videos similar to user's interest vector
- Filter: already watched, blocked accounts, policy violations
- Re-rank by predicted CTR (lightweight ML model)

### Feed API
- GET /feed → returns list of { video_id, manifest_url, thumbnail_url }
- Server pre-fetches next page; client requests when 3 videos remain
- Feed is stateful per session (cursor-based)

### Scale
- 1B users, 500M videos viewed/day
- CDN absorbs 99% of bandwidth
- Recommendation: pre-compute feeds every 15min for active users`,
  },
  {
    title: 'Design Google Drive / Dropbox',
    prompt:
      'Design a cloud file storage service. Users can upload, download, and sync files across devices. Support folders, sharing, and versioning.',
    difficulty: 'Hard',
    category: 'Storage',
    tags: ['s3', 'sql', 'sync', 'delta', 'chunking'],
    modelAnswer: `## Cloud File Storage Design

### Key Challenges
- Large file uploads (chunking)
- Sync across devices (delta sync)
- Conflict resolution

### Upload Flow (Chunked)
1. Client splits file into 4MB chunks, computes SHA-256 per chunk
2. POST /upload/init → server returns upload_id
3. For each chunk: PUT /upload/{upload_id}/chunk/{n} → server checks if chunk hash exists (dedup)
4. POST /upload/complete → server assembles metadata

### Storage
- Chunks: S3 (keyed by SHA-256 hash — automatic dedup across users)
- File metadata: PostgreSQL (file_id, user_id, name, parent_folder_id, size, version)
- Chunk index: file_id → [chunk_hash_1, chunk_hash_2, ...] (PostgreSQL array)

### Sync Protocol
1. Client polls /changes?since=cursor or uses WebSocket
2. Server sends delta: list of changed file_ids
3. Client fetches only changed chunks (delta sync)
4. Conflict: last-write-wins or create conflict copy

### Sharing
- Share link: POST /share { file_id, permission } → token
- ACL table: (resource_id, user_id, permission)

### Versioning
- Keep last N versions (configurable)
- Each version = new row in file_versions table pointing to same chunks
- Restore: swap current_version_id

### Bandwidth Optimization
- Chunk dedup: same chunk uploaded by 10 users = stored once
- Delta sync: re-upload only changed chunks on edit`,
  },
  {
    title: 'Design Amazon S3',
    prompt:
      'Design a scalable object storage service. Objects are stored in buckets, identified by keys. Support upload, download, delete, and listing with pagination.',
    difficulty: 'Hard',
    category: 'Storage',
    tags: ['distributed', 'consistent-hashing', 'erasure-coding', 'replication'],
    modelAnswer: `## Object Storage Design (S3)

### API
- PUT /buckets/{bucket}/{key} — upload object
- GET /buckets/{bucket}/{key} — download object
- DELETE /buckets/{bucket}/{key}
- GET /buckets/{bucket}?prefix=&marker= — list objects

### Architecture
- Metadata service: stores bucket/key → object location mapping
- Data nodes: store actual bytes, replicated across AZs
- Gateway: routes requests, handles auth

### Data Placement
- Consistent hashing ring: distribute objects across data nodes
- Each object replicated to 3 nodes (primary + 2 replicas)
- Quorum writes (W=2), quorum reads (R=2), N=3 → eventual consistency

### Durability
- Erasure coding (RS 6+3): split object into 6 data + 3 parity shards
- Survive loss of any 3 shards
- Background scrubbing: detect and repair bit rot

### Metadata
- Key → { node_id, offset, size, checksum, version_id }
- Stored in distributed KV (etcd or Cassandra)

### Large Object Upload
- Multipart upload: client splits into parts ≥5MB
- Each part uploaded independently
- CompleteMultipartUpload assembles parts server-side

### Consistency
- Read-after-write for new objects (PUT then GET succeeds)
- Eventual consistency for overwrite/delete (mirrors real S3)`,
  },
  {
    title: 'Design a CDN',
    prompt:
      'Design a content delivery network that caches static assets (images, JS, CSS, video) at edge servers worldwide. Explain cache invalidation, origin pull, and how routing works.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['cdn', 'anycast', 'cache', 'ttl', 'dns'],
    modelAnswer: `## CDN Design

### Goal
Serve static content from edge servers close to users, reducing latency from 200ms (cross-ocean) to <20ms.

### Components
- Origin server: canonical source of truth
- Edge PoPs (Points of Presence): 50–100 cities globally, each has cache servers
- DNS: routes user to nearest PoP via anycast or GeoDNS

### Request Flow
1. User: GET assets.example.com/logo.png
2. DNS resolves to nearest PoP IP (anycast: BGP routes to nearest PoP)
3. PoP cache HIT → return cached response
4. PoP cache MISS → fetch from origin, cache with TTL, return to user

### Caching
- Cache-Control: max-age=86400 (set by origin)
- ETag / Last-Modified for conditional requests
- Vary: Accept-Encoding to cache gzip and br separately

### Cache Invalidation
- Wait for TTL (simplest) — stale for up to TTL duration
- URL versioning: /logo.v3.png — change URL on deploy, old TTL irrelevant
- API purge: POST /cdn/purge { urls: [...] } — push invalidation to all PoPs

### Tiered Caching
- L1: edge PoP (city-level)
- L2: regional hub (continent-level)
- Origin: final fallback
- Reduces origin load dramatically

### Health & Failover
- Each PoP has 10+ servers behind a load balancer
- If PoP fails: DNS/BGP fails over to next-nearest PoP`,
  },
  {
    title: 'Design a Cache System (Redis)',
    prompt:
      'Design a distributed caching layer for a high-traffic web application. Cover eviction policies, consistency strategies, and how to handle cache stampede and hot keys.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['redis', 'eviction', 'consistency', 'sharding'],
    modelAnswer: `## Distributed Cache Design

### Role of Cache
Sit between app servers and database; serve reads from memory (sub-ms) instead of DB (10-100ms).

### Cache Strategies

**Cache-Aside (Lazy Loading)**
1. App checks cache
2. Cache miss → app reads DB → writes to cache → returns data
3. Cache hit → return directly
- Pros: only caches what's needed; resilient to cache failure
- Cons: cold start latency; stale data possible

**Write-Through**
- On write: update cache AND DB synchronously
- Pros: cache always fresh
- Cons: write latency doubles; cache fills with rarely-read data

**Write-Behind (Write-Back)**
- Write to cache immediately, async flush to DB
- Pros: fast writes
- Cons: data loss if cache fails before flush

### Eviction Policies
- LRU (Least Recently Used): best general-purpose
- LFU (Least Frequently Used): good for popularity skew
- TTL: always set TTL to prevent stale data accumulation

### Cache Stampede
- Problem: many requests miss simultaneously (after TTL expiry), all hit DB
- Solutions:
  - Mutex lock: first request fetches, others wait
  - Probabilistic early expiration: randomly refresh before TTL expires
  - Background refresh: async refresh before TTL, serve stale briefly

### Hot Keys
- Problem: one key receives millions of req/sec (e.g., celebrity user)
- Solutions:
  - Local in-process cache on app server (copy of hot key)
  - Shard hot key: key_1, key_2, key_3 — app picks randomly

### Cluster
- Redis Cluster: 16384 hash slots, each master owns a slot range
- Each master has replicas; failover via Redis Sentinel or Cluster`,
  },
  {
    title: 'Design Apache Kafka',
    prompt:
      'Design a distributed message queue / event streaming platform. Support high-throughput publish-subscribe with durable message storage, consumer groups, and at-least-once delivery.',
    difficulty: 'Hard',
    category: 'Messaging',
    tags: ['kafka', 'partitions', 'consumer-groups', 'replication', 'offset'],
    modelAnswer: `## Distributed Message Queue Design

### Core Concepts
- Topic: named stream of records
- Partition: ordered, immutable log; unit of parallelism
- Producer: writes to topic (chooses partition via key hash or round-robin)
- Consumer Group: each partition consumed by exactly one member

### Write Path
1. Producer → Broker leader of target partition
2. Leader appends to partition log (segment file on disk)
3. Replicate to ISR (In-Sync Replicas): acks=all → wait for all ISR to confirm
4. Return offset to producer

### Read Path
1. Consumer polls broker: FETCH topic=orders, partition=2, offset=1042
2. Broker returns records from offset
3. Consumer processes, commits offset (to __consumer_offsets topic)
4. On crash + restart: resume from last committed offset (at-least-once)

### Durability
- Each partition replicated across N brokers (default 3)
- Leader election via ZooKeeper / KRaft if leader fails
- Log compaction: keep only latest value per key (for changelog topics)

### Throughput
- Sequential disk writes (append-only log) = 500MB/s+
- Zero-copy transfer: sendfile() bypasses kernel↔user copy
- Batching: producer batches records, consumer fetches batches

### Consumer Groups
- 4 partitions, 4 consumers → each consumer owns 1 partition
- 4 partitions, 2 consumers → each consumer owns 2 partitions
- Adding consumer → rebalance (brief pause)

### Retention
- Time-based: delete segments older than 7 days
- Size-based: delete oldest when log exceeds 100GB`,
  },
  {
    title: 'Design a Notification System',
    prompt:
      'Design a notification system that delivers push notifications, emails, and SMS to millions of users. Support user preferences, rate limiting, and retry on failure.',
    difficulty: 'Medium',
    category: 'Messaging',
    tags: ['kafka', 'fcm', 'sendgrid', 'twilio', 'rate-limiting'],
    modelAnswer: `## Notification System Design

### Channels
- Push: APNs (iOS), FCM (Android)
- Email: SendGrid / SES
- SMS: Twilio

### Architecture

**Ingestion Layer**
- POST /notifications { user_id, type, template_id, data }
- Validate, enrich with user preferences
- Publish to Kafka topic per channel: notifications.push, notifications.email, notifications.sms

**Worker Layer (per channel)**
- Kafka consumer group per channel
- Workers dequeue, render template, call provider API
- On failure: retry with exponential backoff (3 attempts), then dead-letter queue

**User Preferences Service**
- GET /preferences/{user_id} → { push: true, email: false, sms: true, quiet_hours: "22:00-08:00" }
- Check preferences before enqueuing per channel

### Rate Limiting
- Per user: max 10 push/hour, 5 email/day, 3 SMS/day
- Sliding window counter in Redis
- If limit exceeded: drop or schedule for next window

### Template Engine
- Templates stored in DB: { id, channel, subject, body_html, body_text }
- Mustache/Handlebars rendering server-side
- Localization: template has locale variants

### Retry & DLQ
- Max 3 retries with exponential backoff (1s, 2s, 4s)
- Failed after 3: move to DLQ Kafka topic
- Ops alert on DLQ growth; manual replay tool

### Tracking
- Delivery event → analytics Kafka topic
- Track: sent, delivered, opened, clicked (pixel/link tracking for email)`,
  },
  {
    title: 'Design Google Search Autocomplete',
    prompt:
      'Design the search query autocomplete feature that shows suggestions as the user types. Suggestions should be ranked by popularity and personalized. Handle 10K requests per second.',
    difficulty: 'Medium',
    category: 'Search',
    tags: ['trie', 'redis', 'kafka', 'ranking'],
    modelAnswer: `## Search Autocomplete Design

### Requirements
- Return top-5 suggestions for prefix in <100ms
- Ranked by popularity (global + personalized)
- Update rankings based on recent search volume

### Data Structure: Trie
- Trie node: char → children map + top-5 suggestions cached at each node
- Insert: walk/create path, update top-5 at each node if new query > min score
- Query: walk to prefix node → return cached top-5 (O(prefix_length))
- Tradeoff: memory-heavy; store in Redis as hash (prefix → JSON top-5)

### Scale: Distributed Approach
- Shard trie by first letter (or first 2 letters)
- Each shard served by dedicated Redis cluster
- Trie rebuilt periodically (every 1h) from aggregated search logs

### Ranking
- Score = query_count (weekly) × recency_weight
- Collect: every search → Kafka → Flink aggregation → sorted set per prefix
- Redis ZSET: prefix → { query: score } → ZREVRANGE → top-5

### Personalization
- Blend: 70% global score + 30% user's own recent searches
- User's recent searches: Redis list (last 20 queries)
- Merge at query time: fetch global top-5 + user recents → re-rank

### API
- GET /autocomplete?q=des&locale=en → ["design twitter", "design uber", ...]
- Cache-Control: max-age=60 (suggestions stable for 60s)
- CDN caches popular prefixes

### Filtering
- Block autocomplete for offensive terms (blocklist check O(1) with Bloom filter)`,
  },
  {
    title: 'Design Elasticsearch',
    prompt:
      'Design a distributed full-text search engine. Support indexing documents, full-text search with ranking, and filtering. Handle millions of documents.',
    difficulty: 'Hard',
    category: 'Search',
    tags: ['inverted-index', 'lucene', 'sharding', 'ranking'],
    modelAnswer: `## Distributed Search Engine Design

### Core: Inverted Index
- Forward index: doc_id → [word1, word2, ...]
- Inverted index: word → [doc_id, position, frequency, ...]
- Query "design system" → intersect posting lists for "design" ∩ "system"

### Indexing Pipeline
1. POST /index { id, title, body, tags }
2. Tokenize: lowercase, remove stop words, stem ("designing" → "design")
3. Build inverted index entries
4. Store in immutable segment files (Lucene segments)
5. Periodically merge small segments into larger ones (reduce I/O)

### Ranking (BM25)
- TF (term frequency in doc) × IDF (inverse document frequency)
- BM25 improves on TF-IDF: saturates at high TF, normalizes by doc length
- Boost factors: title match > body match; recency boost

### Distributed Architecture
- Index split into N primary shards (e.g., 5)
- Each shard replicated to M replicas (e.g., 1)
- Routing: shard = hash(doc_id) % N
- Coordinator node: scatter query to all shards, gather + merge + sort results

### Query Flow
1. Client → coordinator: GET /search?q=system+design
2. Coordinator → all shards: search(q, top-10)
3. Each shard: search local index, return top-10 with scores
4. Coordinator: merge lists, global re-rank, return top-10

### Near Real-Time
- In-memory buffer → searchable in 1s (refresh interval)
- Durable: write-ahead log (translog) → fsync periodically

### Filters
- Structured data (tags, date range): stored separately as doc values (columnar)
- Filter query: bitmap of matching docs → AND with text search results`,
  },
  {
    title: 'Design a Chat Application',
    prompt:
      'Design a real-time chat system like WhatsApp or Slack. Support 1:1 messaging, group chats, message history, online/offline status, and message delivery receipts.',
    difficulty: 'Hard',
    category: 'Real-time',
    tags: ['websocket', 'kafka', 'cassandra', 'redis', 'presence'],
    modelAnswer: `## Chat Application Design

### Real-Time Layer
- WebSocket connections: each client maintains persistent WS to a chat server
- Chat server holds: user_id → WebSocket connection map
- Problem: user A on server 1, user B on server 2 — how does A's message reach B?
- Solution: pub/sub via Redis or Kafka (inter-server message bus)

### Message Flow (1:1)
1. A sends message → A's chat server
2. Chat server publishes to Redis channel: "user:{B_id}"
3. B's chat server subscribes to "user:{B_id}" → receives message
4. B's chat server pushes over WebSocket to B
5. Message stored in Cassandra

### Offline Handling
- If B is offline: no WS connection; message queued in Redis/Kafka
- On B reconnect: server sends unread messages (pulled from DB by last_seen timestamp)

### Message Storage (Cassandra)
```
messages (
  conversation_id UUID,
  message_id      UUID,  -- TimeUUID for ordering
  sender_id       UUID,
  body            TEXT,
  sent_at         TIMESTAMP
  PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC)
```

### Group Chat
- Group message → fan-out to all members
- For large groups (>500): fan-out via Kafka topic per group
- Members fetch messages from DB (pull model) to avoid N×write fan-out

### Presence
- Client sends heartbeat every 30s
- Redis: user_id → last_seen_timestamp (TTL 60s)
- Online = last_seen within 60s

### Delivery Receipts
- Sent (✓): message stored in DB
- Delivered (✓✓): receiver's device received over WS — ack sent to sender
- Read (blue ✓✓): receiver opened conversation — read receipt sent`,
  },
  {
    title: 'Design Uber Live Location Tracking',
    prompt:
      'Design the real-time location tracking system for a ride-sharing app. Drivers send GPS coordinates every 4 seconds; riders see driver location updated in real time.',
    difficulty: 'Hard',
    category: 'Real-time',
    tags: ['websocket', 'redis', 'geospatial', 'kafka'],
    modelAnswer: `## Live Location Tracking Design

### Requirements
- 1M drivers sending location every 4s = 250K writes/sec
- Rider sees driver location update within 5s
- Find nearby drivers within radius

### Write Path (Driver → System)
1. Driver mobile app → POST /location { driver_id, lat, lng, timestamp } every 4s
2. Location service writes to Redis GEO: GEOADD drivers lng lat driver_id
3. Also publishes to Kafka topic: driver.location (for audit, ML, analytics)

### Read Path (Rider sees driver)
- Option A: Polling — rider polls GET /driver/{id}/location every 3s
  - Simple, stateless, slightly stale
- Option B: WebSocket push — location service pushes updates to rider's WS connection
  - Lower latency, server maintains connection state
- Choice: WebSocket for active ride; polling for "find drivers nearby" list

### Nearby Driver Search
- Redis GEORADIUS drivers lng lat 5 km COUNT 10 ASC
- Returns up to 10 closest drivers within 5km
- Called when rider opens app to show available cars

### Driver Location Storage
- Redis GEO: current location only (overwrite on each update)
- Kafka → S3: full location history (for analytics, replay)
- Trip route: store sampled locations in PostgreSQL during active ride

### Scale
- 250K writes/sec → Redis cluster (horizontal sharding by driver_id hash)
- Separate Redis cluster per city/region
- Location service is stateless; deploy many instances behind LB

### ETA Calculation
- Google Maps API or in-house routing engine
- Current driver position + road graph → ETA`,
  },
  {
    title: 'Design a Rate Limiter',
    prompt:
      'Design a rate limiter that restricts API usage to N requests per time window per user. It must work in a distributed environment where requests hit different servers.',
    difficulty: 'Medium',
    category: 'Infrastructure',
    tags: ['redis', 'sliding-window', 'token-bucket', 'middleware'],
    modelAnswer: `## Rate Limiter Design

### Algorithms

**Fixed Window Counter**
- Redis: INCR user:{id}:window:{minute}; EXPIRE to window end
- Simple; burst at window boundary (100 at 0:59, 100 at 1:01 = 200 in 2s)

**Sliding Window Log**
- Redis sorted set: score = timestamp, value = request_id
- ZADD + ZREMRANGEBYSCORE (remove old) + ZCARD (count)
- Accurate; memory-heavy (stores every request timestamp)

**Sliding Window Counter (recommended)**
- Estimate: current_count = prev_window_count × overlap_ratio + current_window_count
- Memory-efficient; approximate but accurate within 0.1%

**Token Bucket**
- Each user has bucket of N tokens; refill at rate R/sec
- Allows bursts up to bucket capacity
- Best for APIs where bursts are acceptable

### Distributed Implementation
- Shared state in Redis (all app servers hit same Redis)
- Lua script for atomic check-and-increment (prevents race conditions):
  ```lua
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return count
  ```
- If count > limit: return 429 Too Many Requests

### Response Headers
- X-RateLimit-Limit: 100
- X-RateLimit-Remaining: 43
- X-RateLimit-Reset: 1714000000 (epoch when window resets)
- Retry-After: 30 (seconds until retry allowed, on 429)

### Tiers
- IP-based: protect unauthenticated endpoints
- User-based: per API key / user_id
- Endpoint-based: stricter limits on expensive endpoints`,
  },
  {
    title: 'Design a Load Balancer',
    prompt:
      'Design a layer 7 (HTTP) load balancer that distributes traffic across backend servers. Cover algorithms, health checks, sticky sessions, and how to make the load balancer itself highly available.',
    difficulty: 'Medium',
    category: 'Infrastructure',
    tags: ['load-balancing', 'health-check', 'consistent-hashing', 'ha'],
    modelAnswer: `## Load Balancer Design

### Layer 7 LB
- Terminates TLS, reads HTTP headers, routes based on URL/header/cookie
- Reverse proxy: client talks to LB, LB forwards to backends

### Algorithms
- Round Robin: simple, even distribution; ignores server load
- Least Connections: route to server with fewest active connections; better for varying request cost
- IP Hash: same client → same server (poor man's sticky sessions)
- Consistent Hashing: minimal reshuffling when adding/removing servers

### Health Checks
- Active: LB sends GET /health to each backend every 5s
- Passive: detect failures from 5xx responses (circuit breaker)
- Remove unhealthy backend from pool; re-add after N consecutive successes

### Sticky Sessions
- Problem: stateful apps (session in server memory) need same server
- Solution A: LB sets cookie with server_id; subsequent requests route to that server
- Solution B (better): move session to shared store (Redis) — stateless backends

### TLS Termination
- LB handles TLS (cert stored on LB); backend traffic is HTTP
- Reduces CPU on backends; simpler cert management
- Or: TLS passthrough (LB routes by SNI, backend handles TLS)

### High Availability of LB
- Active-Passive: standby LB takes over if active fails (via keepalived + VIP)
- Active-Active: DNS round-robin across 2 LBs; both serve traffic
- Anycast: BGP announces same IP from multiple PoPs; BGP routes to nearest

### Modern: Service Mesh
- Sidecar proxy (Envoy) on each pod handles LB, retries, circuit breaking
- No single LB bottleneck; decentralized`,
  },
  {
    title: 'Design a Circuit Breaker',
    prompt:
      'Design the circuit breaker pattern for a microservices system. Explain states, transitions, thresholds, and how it prevents cascading failures.',
    difficulty: 'Easy',
    category: 'Infrastructure',
    tags: ['resilience', 'microservices', 'circuit-breaker', 'fallback'],
    modelAnswer: `## Circuit Breaker Pattern

### Problem
Service A calls Service B. B is slow/failing. Without circuit breaker: A's thread pool exhausts waiting for B → A fails → upstream C fails (cascade).

### States
- **Closed** (normal): requests flow through; failure count tracked
- **Open** (tripped): requests fail immediately (no network call); fallback returned
- **Half-Open** (recovery probe): 1 test request allowed; if success → Closed; if fail → Open

### Transitions
- Closed → Open: failure rate > threshold (e.g., 50% of last 60s) OR slow call rate > threshold
- Open → Half-Open: after timeout (e.g., 30s)
- Half-Open → Closed: probe request succeeds
- Half-Open → Open: probe request fails

### Thresholds
- Minimum calls before evaluating: 10 (avoid tripping on 1/2 failures)
- Failure rate threshold: 50%
- Slow call threshold: >2s = slow; if >50% slow → Open
- Open duration: 30s before trying Half-Open

### Fallback Strategies
- Return cached response (stale but acceptable)
- Return default value (empty list, "unavailable" message)
- Call alternative service
- Fail fast with clear error (better UX than timeout)

### Implementation (libraries)
- Java: Resilience4j, Hystrix (deprecated)
- Go: sony/gobreaker
- Python: pybreaker
- Node: opossum

### Metrics to Monitor
- State transitions (alert on Open)
- Failure rate per service
- Fallback invocation rate`,
  },
  {
    title: 'Design a Web Crawler',
    prompt:
      'Design a distributed web crawler that can index billions of web pages. Cover URL frontier management, politeness, deduplication, and how to scale.',
    difficulty: 'Hard',
    category: 'Infrastructure',
    tags: ['distributed', 'queue', 'bloom-filter', 'robots-txt'],
    modelAnswer: `## Web Crawler Design

### Components
1. URL Frontier (priority queue of URLs to crawl)
2. Fetcher (downloads HTML)
3. Parser (extracts links + content)
4. Dedup store (seen URLs)
5. Storage (raw HTML + extracted data)

### URL Frontier
- Two-level queue: priority queue (importance) → per-domain FIFO queues
- Per-domain queues enforce politeness (crawl-delay from robots.txt)
- Selector: picks from high-priority domain queues; enforces ≥1s between requests to same domain

### Politeness
- Respect robots.txt: fetch /robots.txt before first crawl; cache per domain
- Crawl-delay directive: honor wait time between requests
- User-Agent: identify crawler honestly

### Deduplication
- URL level: Bloom filter (fast, probabilistic; rare false positives OK)
- Content level: SimHash of page content → detect near-duplicate pages
- Store canonical URL after URL normalization (lowercase, remove tracking params)

### Fetcher
- Distributed workers, each handling ~100 domains
- DNS caching (TTL 5min) to reduce DNS lookup overhead
- Timeout: 10s connect, 30s read
- Follow up to 5 redirects; detect cycles

### Storage
- Raw HTML: S3 (compressed, deduplicated)
- Extracted links: pushed back to URL frontier queue (Kafka)
- Structured content: Elasticsearch for search index

### Scale
- 1B pages, avg 100KB = 100TB raw HTML
- 10K pages/sec = 864M pages/day
- 100 crawler workers, each handling 100 req/sec
- Shard URL frontier by domain hash`,
  },
]
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add data/questions.ts
git commit -m "feat: add 20-question curated question bank"
```

---

## Task 8: Database Seed

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Create `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import { questions } from '../data/questions'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  await prisma.question.deleteMany()

  for (const q of questions) {
    await prisma.question.create({
      data: {
        title: q.title,
        prompt: q.prompt,
        difficulty: q.difficulty,
        category: q.category,
        tags: JSON.stringify(q.tags),
        modelAnswer: q.modelAnswer,
      },
    })
  }

  console.log(`Seeded ${questions.length} questions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: `Seeded 20 questions.`

- [ ] **Step 3: Verify data**

```bash
npx prisma studio
```

Open browser at `http://localhost:5555`, confirm 20 questions in Question table. Close Prisma Studio (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add database seed with 20 questions"
```

---

## Task 9: API Routes — Questions

**Files:**
- Create: `src/app/api/questions/route.ts`
- Create: `src/app/api/questions/[id]/route.ts`

- [ ] **Step 1: Create `src/app/api/questions/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const difficulty = searchParams.get('difficulty')
  const category = searchParams.get('category')

  const questions = await prisma.question.findMany({
    where: {
      ...(difficulty && difficulty !== 'All' ? { difficulty } : {}),
      ...(category && category !== 'All' ? { category } : {}),
    },
    include: { progress: true },
    orderBy: { createdAt: 'asc' },
  })

  const now = new Date()
  const result = questions.map((q) => ({
    id: q.id,
    title: q.title,
    prompt: q.prompt,
    difficulty: q.difficulty,
    category: q.category,
    tags: JSON.parse(q.tags) as string[],
    createdAt: q.createdAt.toISOString(),
    status: !q.progress
      ? 'not_started'
      : new Date(q.progress.nextReviewAt) <= now
        ? 'due'
        : 'done',
    nextReviewAt: q.progress?.nextReviewAt.toISOString(),
    lastScore: q.progress?.lastScore ?? null,
  }))

  return NextResponse.json(result)
}
```

- [ ] **Step 2: Create `src/app/api/questions/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: { progress: true },
  })

  if (!question) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: question.id,
    title: question.title,
    prompt: question.prompt,
    difficulty: question.difficulty,
    category: question.category,
    tags: JSON.parse(question.tags) as string[],
    modelAnswer: question.modelAnswer,
    createdAt: question.createdAt.toISOString(),
    progress: question.progress
      ? {
          interval: question.progress.interval,
          easeFactor: question.progress.easeFactor,
          nextReviewAt: question.progress.nextReviewAt.toISOString(),
          lastScore: question.progress.lastScore,
        }
      : null,
  })
}
```

- [ ] **Step 3: Test the routes manually**

```bash
npm run dev &
curl http://localhost:3000/api/questions | head -c 500
curl http://localhost:3000/api/questions?difficulty=Hard | head -c 500
```

Expected: JSON arrays of questions.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/questions/
git commit -m "feat: add GET /api/questions and /api/questions/[id] routes"
```

---

## Task 10: API Route — Evaluate

**Files:**
- Create: `src/app/api/evaluate/route.ts`

- [ ] **Step 1: Create `src/app/api/evaluate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { evaluateAnswer } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const body = await request.json() as { questionId: string; answer: string }

  if (!body.questionId || !body.answer) {
    return NextResponse.json({ error: 'questionId and answer required' }, { status: 400 })
  }

  const question = await prisma.question.findUnique({
    where: { id: body.questionId },
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const feedback = await evaluateAnswer({
    question: question.title + '\n' + question.prompt,
    modelAnswer: question.modelAnswer,
    userAnswer: body.answer,
  })

  return NextResponse.json(feedback)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/evaluate/route.ts
git commit -m "feat: add POST /api/evaluate route"
```

---

## Task 11: API Routes — Sessions + Progress

**Files:**
- Create: `src/app/api/sessions/route.ts`
- Create: `src/app/api/progress/route.ts`
- Create: `src/app/api/progress/[id]/route.ts`

- [ ] **Step 1: Create `src/app/api/sessions/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { AiFeedback } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    questionId: string
    answer: string
    aiFeedback: AiFeedback
    score: number
    durationSecs: number
  }

  const session = await prisma.session.create({
    data: {
      questionId: body.questionId,
      answer: body.answer,
      aiFeedback: JSON.stringify(body.aiFeedback),
      score: body.score,
      durationSecs: body.durationSecs,
    },
  })

  return NextResponse.json({ id: session.id }, { status: 201 })
}
```

- [ ] **Step 2: Create `src/app/api/progress/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const records = await prisma.progress.findMany({
    include: { question: { select: { title: true, category: true } } },
  })

  return NextResponse.json(
    records.map((p) => ({
      id: p.id,
      questionId: p.questionId,
      questionTitle: p.question.title,
      category: p.question.category,
      interval: p.interval,
      easeFactor: p.easeFactor,
      nextReviewAt: p.nextReviewAt.toISOString(),
      lastScore: p.lastScore,
      updatedAt: p.updatedAt.toISOString(),
    }))
  )
}
```

- [ ] **Step 3: Create `src/app/api/progress/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applySm2 } from '@/lib/sm2'
import type { SelfRating } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json() as { rating: SelfRating; score: number }

  const current = await prisma.progress.findUnique({ where: { id: params.id } })

  if (!current) {
    // Create initial progress record
    const question = await prisma.question.findFirst({ where: { progress: null } })
    return NextResponse.json({ error: 'Progress record not found' }, { status: 404 })
  }

  const { interval, easeFactor, nextReviewAt } = applySm2(
    { interval: current.interval, easeFactor: current.easeFactor },
    body.rating
  )

  const updated = await prisma.progress.update({
    where: { id: params.id },
    data: { interval, easeFactor, nextReviewAt: new Date(nextReviewAt), lastScore: body.score },
  })

  return NextResponse.json({
    id: updated.id,
    interval: updated.interval,
    easeFactor: updated.easeFactor,
    nextReviewAt: updated.nextReviewAt.toISOString(),
    lastScore: updated.lastScore,
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/sessions/ src/app/api/progress/
git commit -m "feat: add sessions and progress API routes"
```

---

## Task 12: FilterBar + QuestionRow Components (TDD)

**Files:**
- Create: `src/components/FilterBar.tsx`
- Create: `src/components/QuestionRow.tsx`
- Create: `__tests__/components/FilterBar.test.tsx`
- Create: `__tests__/components/QuestionRow.test.tsx`

- [ ] **Step 1: Write failing FilterBar test**

Create `__tests__/components/FilterBar.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '@/components/FilterBar'

const defaultProps = {
  difficulty: 'All',
  category: 'All',
  status: 'All',
  onDifficultyChange: jest.fn(),
  onCategoryChange: jest.fn(),
  onStatusChange: jest.fn(),
}

describe('FilterBar', () => {
  it('renders difficulty buttons', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('calls onDifficultyChange when Hard clicked', () => {
    const onDifficultyChange = jest.fn()
    render(<FilterBar {...defaultProps} onDifficultyChange={onDifficultyChange} />)
    fireEvent.click(screen.getByText('Hard'))
    expect(onDifficultyChange).toHaveBeenCalledWith('Hard')
  })

  it('highlights active difficulty filter', () => {
    render(<FilterBar {...defaultProps} difficulty="Easy" />)
    const easyBtn = screen.getByText('Easy')
    expect(easyBtn.closest('button')).toHaveClass('ring-2')
  })
})
```

- [ ] **Step 2: Write failing QuestionRow test**

Create `__tests__/components/QuestionRow.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { QuestionRow } from '@/components/QuestionRow'
import type { QuestionWithStatus } from '@/types'

const q: QuestionWithStatus = {
  id: 'cuid1',
  title: 'Design a URL Shortener',
  prompt: 'Design bit.ly',
  difficulty: 'Medium',
  category: 'URL/ID',
  tags: ['redis', 'sql'],
  modelAnswer: '...',
  createdAt: new Date().toISOString(),
  status: 'not_started',
}

describe('QuestionRow', () => {
  it('renders question title', () => {
    render(<table><tbody><QuestionRow question={q} /></tbody></table>)
    expect(screen.getByText('Design a URL Shortener')).toBeInTheDocument()
  })

  it('shows "Not started" for not_started status', () => {
    render(<table><tbody><QuestionRow question={q} /></tbody></table>)
    expect(screen.getByText('Not started')).toBeInTheDocument()
  })

  it('shows "Due now" for due status', () => {
    render(<table><tbody><QuestionRow question={{ ...q, status: 'due' }} /></tbody></table>)
    expect(screen.getByText('📅 Due now')).toBeInTheDocument()
  })

  it('shows difficulty dot with correct color class', () => {
    render(<table><tbody><QuestionRow question={q} /></tbody></table>)
    const dot = screen.getByTestId('difficulty-dot')
    expect(dot).toHaveClass('text-yellow-400')
  })
})
```

- [ ] **Step 3: Run to verify fail**

```bash
npx jest __tests__/components/ --no-coverage
```

Expected: FAIL — components not found

- [ ] **Step 4: Create `src/components/FilterBar.tsx`**

```typescript
'use client'

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard'
type Category = 'All' | 'Scalability' | 'Storage' | 'Caching' | 'Messaging' | 'Search' | 'Real-time' | 'Infrastructure' | 'URL/ID'
type StatusFilter = 'All' | 'Not Started' | 'Done' | 'Due Today'

interface FilterBarProps {
  difficulty: string
  category: string
  status: string
  onDifficultyChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onStatusChange: (v: string) => void
}

const difficulties: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard']
const categories: Category[] = ['All', 'Scalability', 'Storage', 'Caching', 'Messaging', 'Search', 'Real-time', 'Infrastructure', 'URL/ID']
const statuses: StatusFilter[] = ['All', 'Not Started', 'Done', 'Due Today']

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
  All: 'text-gray-300',
}

export function FilterBar({ difficulty, category, status, onDifficultyChange, onCategoryChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {difficulties.map((d) => (
        <button
          key={d}
          onClick={() => onDifficultyChange(d)}
          className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
            difficulty === d
              ? 'ring-2 ring-offset-1 ring-blue-400 bg-gray-700 border-blue-400'
              : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
          } ${difficultyColor[d]}`}
        >
          {d}
        </button>
      ))}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-1 rounded text-sm bg-gray-800 border border-gray-600 text-gray-300"
      >
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-1 rounded text-sm bg-gray-800 border border-gray-600 text-gray-300"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/QuestionRow.tsx`**

```typescript
import Link from 'next/link'
import type { QuestionWithStatus } from '@/types'

const difficultyDotColor: Record<string, string> = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400',
}

function StatusBadge({ question }: { question: QuestionWithStatus }) {
  if (question.status === 'due') {
    return <span className="text-red-400 text-sm">📅 Due now</span>
  }
  if (question.status === 'done' && question.nextReviewAt) {
    const days = Math.ceil(
      (new Date(question.nextReviewAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return <span className="text-green-400 text-sm">✓ Done · review in {days}d</span>
  }
  return <span className="text-gray-400 text-sm">Not started</span>
}

export function QuestionRow({ question }: { question: QuestionWithStatus }) {
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
      <td className="py-3 px-4 w-6">
        <span
          data-testid="difficulty-dot"
          className={`text-lg ${difficultyDotColor[question.difficulty]}`}
        >
          ●
        </span>
      </td>
      <td className="py-3 px-4">
        <Link
          href={`/practice/${question.id}`}
          className="text-gray-100 hover:text-blue-400 font-medium transition-colors"
        >
          {question.title}
        </Link>
        <div className="text-xs text-gray-500 mt-0.5">{question.category}</div>
      </td>
      <td className="py-3 px-4 text-right">
        <StatusBadge question={question} />
      </td>
    </tr>
  )
}
```

- [ ] **Step 6: Run tests to verify pass**

```bash
npx jest __tests__/components/ --no-coverage
```

Expected: PASS — 6 tests

- [ ] **Step 7: Commit**

```bash
git add src/components/ __tests__/components/
git commit -m "feat: add FilterBar and QuestionRow components with tests"
```

---

## Task 13: Home Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { FilterBar } from '@/components/FilterBar'
import { QuestionRow } from '@/components/QuestionRow'
import type { QuestionWithStatus } from '@/types'

export default function HomePage() {
  const [questions, setQuestions] = useState<QuestionWithStatus[]>([])
  const [difficulty, setDifficulty] = useState('All')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (difficulty !== 'All') params.set('difficulty', difficulty)
    if (category !== 'All') params.set('category', category)

    setLoading(true)
    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((data: QuestionWithStatus[]) => {
        setQuestions(data)
        setLoading(false)
      })
  }, [difficulty, category])

  const filtered = questions.filter((q) => {
    if (status === 'All') return true
    if (status === 'Not Started') return q.status === 'not_started'
    if (status === 'Done') return q.status === 'done'
    if (status === 'Due Today') return q.status === 'due'
    return true
  })

  const dueCount = questions.filter((q) => q.status === 'due').length

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">System Design Practice</h1>
        {dueCount > 0 && (
          <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
            📅 {dueCount} due for review
          </span>
        )}
      </div>

      <FilterBar
        difficulty={difficulty}
        category={category}
        status={status}
        onDifficultyChange={setDifficulty}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      {loading ? (
        <div className="text-gray-400 py-12 text-center">Loading questions...</div>
      ) : (
        <table className="w-full">
          <tbody>
            {filtered.map((q) => (
              <QuestionRow key={q.id} question={q} />
            ))}
          </tbody>
        </table>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 py-8 text-center">No questions match your filters.</p>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify dev server shows home page**

```bash
curl http://localhost:3000/ | grep "System Design Practice"
```

Expected: HTML containing "System Design Practice"

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: implement home page with filterable question list"
```

---

## Task 14: Timer Component (TDD)

**Files:**
- Create: `src/components/Timer.tsx`
- Create: `__tests__/components/Timer.test.tsx`

- [ ] **Step 1: Write failing Timer test**

Create `__tests__/components/Timer.test.tsx`:

```typescript
import { render, screen, act } from '@testing-library/react'
import { Timer } from '@/components/Timer'

jest.useFakeTimers()

describe('Timer', () => {
  it('displays initial time correctly', () => {
    render(<Timer totalSeconds={2700} onExpire={jest.fn()} />)
    expect(screen.getByText('45:00')).toBeInTheDocument()
  })

  it('counts down each second', () => {
    render(<Timer totalSeconds={2700} onExpire={jest.fn()} />)
    act(() => { jest.advanceTimersByTime(1000) })
    expect(screen.getByText('44:59')).toBeInTheDocument()
  })

  it('calls onExpire when timer reaches zero', () => {
    const onExpire = jest.fn()
    render(<Timer totalSeconds={2} onExpire={onExpire} />)
    act(() => { jest.advanceTimersByTime(2000) })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('shows red color when under 5 minutes', () => {
    render(<Timer totalSeconds={299} onExpire={jest.fn()} />)
    const display = screen.getByTestId('timer-display')
    expect(display).toHaveClass('text-red-400')
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npx jest __tests__/components/Timer.test.tsx --no-coverage
```

Expected: FAIL — Timer not found

- [ ] **Step 3: Create `src/components/Timer.tsx`**

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'

interface TimerProps {
  totalSeconds: number
  onExpire: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function Timer({ totalSeconds, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current()
      return
    }
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isLow = remaining < 300
  return (
    <span
      data-testid="timer-display"
      className={`font-mono font-bold text-lg px-3 py-1 rounded ${
        isLow ? 'text-red-400 bg-red-950' : 'text-gray-200 bg-gray-800'
      }`}
    >
      {formatTime(remaining)}
    </span>
  )
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npx jest __tests__/components/Timer.test.tsx --no-coverage
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/Timer.tsx __tests__/components/Timer.test.tsx
git commit -m "feat: implement countdown Timer component with tests"
```

---

## Task 15: Practice Page (Answer Editor)

**Files:**
- Create: `src/app/practice/[id]/page.tsx`

- [ ] **Step 1: Create `src/app/practice/[id]/page.tsx`**

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Timer } from '@/components/Timer'
import type { Question } from '@/types'

const DEFAULT_MINUTES = 45

export default function PracticePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES)
  const [started, setStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then(setQuestion)
  }, [id])

  async function handleSubmit() {
    if (!question || !answer.trim()) return
    setSubmitting(true)

    const durationSecs = Math.floor((Date.now() - startTimeRef.current) / 1000)

    // Evaluate with AI
    const evalRes = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: id, answer }),
    })
    const feedback = await evalRes.json()

    // Save session
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: id,
        answer,
        aiFeedback: feedback,
        score: feedback.score,
        durationSecs,
      }),
    })

    // Store feedback in sessionStorage for feedback page
    sessionStorage.setItem(`feedback:${id}`, JSON.stringify({ feedback, answer, durationSecs }))

    router.push(`/practice/${id}/feedback`)
  }

  if (!question) {
    return <div className="text-gray-400 p-8 text-center">Loading...</div>
  }

  if (!started) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
              question.difficulty === 'Hard' ? 'bg-red-900 text-red-300' :
              question.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
              'bg-green-900 text-green-300'
            }`}>{question.difficulty}</span>
            <span className="text-xs text-gray-400">{question.category}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-100 mb-3">{question.title}</h1>
          <p className="text-gray-300 mb-6">{question.prompt}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Timer (min):</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                min={5}
                max={120}
              />
            </div>
            <button
              onClick={() => { startTimeRef.current = Date.now(); setStarted(true) }}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
            >
              ▶ Start
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-100">{question.title}</h1>
        <Timer totalSeconds={minutes * 60} onExpire={handleSubmit} />
      </div>
      <p className="text-gray-400 text-sm mb-3">{question.prompt}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your system design here — describe components, data flow, trade-offs..."
        className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !answer.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
        >
          {submitting ? 'Evaluating...' : 'Submit for Review'}
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/practice/
git commit -m "feat: implement practice page with timer and answer editor"
```

---

## Task 16: Feedback Page

**Files:**
- Create: `src/app/practice/[id]/feedback/page.tsx`

- [ ] **Step 1: Create `src/app/practice/[id]/feedback/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { AiFeedback, Question } from '@/types'

interface StoredFeedback {
  feedback: AiFeedback
  answer: string
  durationSecs: number
}

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [question, setQuestion] = useState<Question & { progress: { id: string } | null } | null>(null)
  const [stored, setStored] = useState<StoredFeedback | null>(null)
  const [rated, setRated] = useState(false)
  const [rating, setRating] = useState<'Easy' | 'Hard' | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(`feedback:${id}`)
    if (raw) setStored(JSON.parse(raw) as StoredFeedback)

    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then(setQuestion)
  }, [id])

  async function handleRating(r: 'Easy' | 'Hard') {
    if (!question || !stored) return
    setRating(r)

    // Create or update progress record
    if (question.progress) {
      await fetch(`/api/progress/${question.progress.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: r, score: stored.feedback.score }),
      })
    } else {
      // Create initial progress via a POST to a helper endpoint
      // For simplicity: use upsert logic through a special progress endpoint
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id, rating: r, score: stored.feedback.score }),
      }).catch(() => {/* already exists */})
    }

    setRated(true)
  }

  if (!stored || !question) {
    return <div className="text-gray-400 p-8 text-center">Loading...</div>
  }

  const { feedback } = stored
  const scoreColor = feedback.score >= 8 ? 'bg-green-500' : feedback.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-bold text-gray-100">{question.title} — Feedback</h1>

      {/* Score */}
      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-black ${scoreColor}`}>
          {feedback.score}
        </div>
        <div>
          <div className="font-semibold text-gray-100">Score: {feedback.score} / 10</div>
          <div className="text-sm text-gray-400">
            {feedback.score >= 8 ? 'Excellent — you nailed it!' : feedback.score >= 5 ? 'Good foundation, some gaps' : 'Needs more depth — review the model answer'}
          </div>
        </div>
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="bg-green-950 border-l-4 border-green-500 rounded-r-lg p-4">
          <div className="font-semibold text-green-400 mb-2">✅ Strengths</div>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-green-200 text-sm">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {feedback.gaps.length > 0 && (
        <div className="bg-red-950 border-l-4 border-red-500 rounded-r-lg p-4">
          <div className="font-semibold text-red-400 mb-2">❌ Gaps</div>
          <ul className="space-y-1">
            {feedback.gaps.map((g, i) => (
              <li key={i} className="text-red-200 text-sm">{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tip */}
      <div className="bg-blue-950 border-l-4 border-blue-500 rounded-r-lg p-4">
        <div className="font-semibold text-blue-400 mb-1">💡 Tip</div>
        <p className="text-blue-200 text-sm">{feedback.tip}</p>
      </div>

      {/* Self-rating */}
      {!rated ? (
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
          <p className="text-gray-300 mb-3 font-medium">How did this feel?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleRating('Easy')}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              😊 Easy
            </button>
            <button
              onClick={() => handleRating('Hard')}
              className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              😅 Hard
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
          Marked as <strong className="text-gray-200">{rating}</strong> — next review scheduled.
        </div>
      )}

      {/* Model Answer (revealed after rating) */}
      {rated && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">📖 Model Answer</h2>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {question.modelAnswer}
          </div>
        </div>
      )}

      {/* Navigation */}
      {rated && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
          >
            Next Question →
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Home
          </button>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Update `src/app/api/progress/route.ts`** to support POST (create initial progress)

Add a `POST` handler to the existing file:

```typescript
// Add this export to src/app/api/progress/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json() as { questionId: string; rating: 'Easy' | 'Hard'; score: number }
  const { interval, easeFactor, nextReviewAt } = applySm2({ interval: 1, easeFactor: 2.5 }, body.rating)

  const progress = await prisma.progress.upsert({
    where: { questionId: body.questionId },
    create: {
      questionId: body.questionId,
      interval,
      easeFactor,
      nextReviewAt: new Date(nextReviewAt),
      lastScore: body.score,
    },
    update: {
      interval,
      easeFactor,
      nextReviewAt: new Date(nextReviewAt),
      lastScore: body.score,
    },
  })

  return NextResponse.json({ id: progress.id }, { status: 201 })
}
```

Also add the missing imports at the top of `src/app/api/progress/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applySm2 } from '@/lib/sm2'
import type { SelfRating } from '@/types'
```

- [ ] **Step 3: Commit**

```bash
git add src/app/practice/[id]/feedback/ src/app/api/progress/route.ts
git commit -m "feat: implement feedback page with AI results and self-rating"
```

---

## Task 17: Progress Page

**Files:**
- Create: `src/app/progress/page.tsx`

- [ ] **Step 1: Create `src/app/progress/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface ProgressRecord {
  id: string
  questionId: string
  questionTitle: string
  category: string
  lastScore: number | null
  nextReviewAt: string
  updatedAt: string
}

interface Stats {
  totalAttempted: number
  totalAvailable: number
  avgScore: number
  streak: number
  weakestCategories: { category: string; avgScore: number }[]
}

export default function ProgressPage() {
  const [records, setRecords] = useState<ProgressRecord[]>([])
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/progress').then((r) => r.json()),
      fetch('/api/questions').then((r) => r.json()),
    ]).then(([progress, questions]) => {
      setRecords(progress as ProgressRecord[])
      setTotalAvailable((questions as unknown[]).length)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading...</div>

  const attempted = records.filter((r) => r.lastScore !== null)
  const avgScore = attempted.length
    ? Math.round((attempted.reduce((s, r) => s + (r.lastScore ?? 0), 0) / attempted.length) * 10) / 10
    : 0

  const categoryScores: Record<string, number[]> = {}
  for (const r of attempted) {
    if (!categoryScores[r.category]) categoryScores[r.category] = []
    categoryScores[r.category].push(r.lastScore ?? 0)
  }
  const weakest = Object.entries(categoryScores)
    .map(([category, scores]) => ({
      category,
      avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Your Progress</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-3xl font-black text-green-400">{records.length}</div>
          <div className="text-xs text-gray-400 mt-1">of {totalAvailable} attempted</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-3xl font-black text-blue-400">{avgScore || '—'}</div>
          <div className="text-xs text-gray-400 mt-1">avg score</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-3xl font-black text-purple-400">
            {records.filter((r) => new Date(r.nextReviewAt) <= new Date()).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">due for review</div>
        </div>
      </div>

      {/* Weakest categories */}
      {weakest.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-semibold text-gray-200 mb-3">Weakest Categories</h2>
          <div className="space-y-2">
            {weakest.map(({ category, avgScore }) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${avgScore * 10}%` }}
                    />
                  </div>
                  <span className="text-sm text-red-400 w-8 text-right">{avgScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History table */}
      {records.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-700">
            <h2 className="font-semibold text-gray-200">History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs">
                <th className="text-left px-5 py-2">Question</th>
                <th className="text-center px-3 py-2">Score</th>
                <th className="text-right px-5 py-2">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-700 last:border-0">
                  <td className="px-5 py-3 text-gray-200">{r.questionTitle}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-bold ${(r.lastScore ?? 0) >= 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {r.lastScore ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400">
                    {new Date(r.nextReviewAt) <= new Date()
                      ? <span className="text-red-400">Due now</span>
                      : new Date(r.nextReviewAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {records.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No attempts yet. <a href="/" className="text-blue-400 hover:underline">Start practicing →</a>
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/progress/page.tsx
git commit -m "feat: implement progress page with stats and history"
```

---

## Task 18: Layout + Navigation

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'System Design Trainer',
  description: 'Practice system design interviews with AI feedback and spaced repetition',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <nav className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-gray-100 hover:text-blue-400 transition-colors">
              ⚙️ System Design Trainer
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-gray-400 hover:text-gray-100 transition-colors">
                Practice
              </Link>
              <Link href="/progress" className="text-gray-400 hover:text-gray-100 transition-colors">
                Progress
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify `src/app/globals.css`** has Tailwind directives (from create-next-app)

```bash
head -5 src/app/globals.css
```

Expected output includes `@tailwind base;` etc.

- [ ] **Step 3: Run full test suite**

```bash
npx jest --coverage
```

Expected: All tests pass. Coverage summary shown.

- [ ] **Step 4: Final end-to-end smoke test**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add app layout and navigation bar"
```

---

## Done

After Task 18 completes, run the app:

```bash
npm run dev
```

Open `http://localhost:3000` — you should see the question list. Click a question, answer it, submit, rate yourself, and see the model answer + spaced repetition scheduled.
