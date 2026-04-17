# System Design Interview Trainer — Design Spec

**Date:** 2026-04-16  
**Status:** Approved

---

## Overview

A personal web app for practicing system design interview questions. You select a question, write your answer under a timer, submit it, and receive structured AI feedback (score, strengths, gaps, one tip) plus a model reference answer. A spaced repetition system schedules which questions to review next based on past performance.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) + TypeScript | Full-stack, single repo, easy deployment |
| ORM + Database | Prisma + SQLite | Local persistence, zero infrastructure |
| AI Evaluation | OpenAI GPT-4o | Structured feedback via API |
| Styling | Tailwind CSS | Rapid, utility-first UI |

API key stored in `.env.local` — never committed.

---

## Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Home — question list with filters |
| `/practice/[id]` | Timed answer editor |
| `/practice/[id]/feedback` | AI feedback + model answer |
| `/progress` | Stats: scores over time, streak, weak categories |

---

## Home Screen (`/`)

A filterable list of all questions. Filters:

- **Difficulty:** Easy / Medium / Hard (color-coded: green / yellow / red)
- **Category:** All / Scalability / Storage / Caching / Messaging / Search / Real-time / Infrastructure
- **Status:** All / Not Started / Done / Due Today

Each row shows:
- Difficulty dot (color)
- Question title
- Status — "Not started", "✓ Done · review in Xd", or "📅 Due now"

---

## Practice Flow

Four sequential views (screens 3 and 4 are sections on the same `/practice/[id]/feedback` page):

1. **Question card** (`/`) — title, difficulty, category, brief prompt. Buttons: Start (with timer setting) / Skip.
2. **Answer editor** (`/practice/[id]`) — countdown timer (default 45 min, configurable), plain textarea, Submit button.
3. **AI Feedback** (`/practice/[id]/feedback`, top section) — score (1–10), strengths (green), gaps (red), one tip (blue). Difficulty self-rating buttons: Easy / Hard (feeds SM-2).
4. **Model Answer** (`/practice/[id]/feedback`, bottom section) — structured reference solution revealed after self-rating. Buttons: Next Question / Home.

---

## AI Evaluation

After submitting, the app calls GPT-4o with a system prompt containing:
- The question
- The model answer
- Evaluation rubric (completeness, correctness, depth, trade-offs)

GPT-4o returns JSON:

```json
{
  "score": 7,
  "strengths": ["Clear API design", "Correct database choice"],
  "gaps": ["Missing cache layer (Redis)", "No mention of collision handling"],
  "tip": "Always address the cache layer for read-heavy systems — it's a signal interviewers look for."
}
```

The response is parsed and rendered in the feedback screen.

---

## Spaced Repetition (SM-2)

After viewing feedback, the user self-rates difficulty:
- **Easy** → longer interval before next review
- **Hard** → shorter interval, resurfaces sooner

The SM-2 algorithm updates `ease_factor` and computes `next_review_at`. Questions where `next_review_at <= now` are flagged as "📅 Due now" in the list.

Initial intervals: 1 day (Hard) / 3 days (Easy). Subsequent intervals scale by `ease_factor` (starts at 2.5).

---

## Question Bank

~50 curated questions sourced from NeetCode, Grokking the System Design Interview, and common FAANG interview lists.

**Categories and sample questions:**

| Category | Examples |
|---|---|
| Scalability | Design Twitter Feed, Design Instagram, Design TikTok |
| Storage | Design Google Drive, Design Dropbox, Design S3 |
| Caching | Design a CDN, Design a Cache System |
| Messaging | Design Kafka, Design a Notification System |
| Search | Design Google Search Autocomplete, Design Elasticsearch |
| Real-time | Design a Chat App, Design Uber Live Location |
| Infrastructure | Design a Rate Limiter, Design a Load Balancer, Design a Circuit Breaker |
| URL/ID | Design a URL Shortener, Design a Unique ID Generator |

Each question stores:
- `title` — short name
- `prompt` — 2–3 sentence context (what interviewers expect)
- `difficulty` — Easy / Medium / Hard
- `category` — one of the above
- `tags` — e.g., ["redis", "cdn", "sql", "sharding"]
- `model_answer` — structured reference (markdown, ~400–600 words)

---

## Data Models

```prisma
model Question {
  id           String    @id @default(cuid())
  title        String
  prompt       String
  difficulty   String    // "Easy" | "Medium" | "Hard"
  category     String
  tags         String    // JSON array stored as string
  modelAnswer  String
  sessions     Session[]
  progress     Progress?
  createdAt    DateTime  @default(now())
}

model Session {
  id            String   @id @default(cuid())
  questionId    String
  question      Question @relation(fields: [questionId], references: [id])
  answer        String
  aiFeedback    String   // JSON stored as string
  score         Int
  durationSecs  Int
  createdAt     DateTime @default(now())
}

model Progress {
  id            String   @id @default(cuid())
  questionId    String   @unique
  question      Question @relation(fields: [questionId], references: [id])
  interval      Int      @default(1)    // days until next review
  easeFactor    Float    @default(2.5)
  nextReviewAt  DateTime @default(now())
  lastScore     Int?
  updatedAt     DateTime @updatedAt
}
```

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/questions` | List all questions (with filters) |
| GET | `/api/questions/[id]` | Get single question |
| POST | `/api/sessions` | Save a completed session |
| POST | `/api/evaluate` | Send answer to GPT-4o, return feedback JSON |
| GET | `/api/progress` | Get all progress records |
| PATCH | `/api/progress/[id]` | Update SM-2 after self-rating |

---

## Progress Page (`/progress`)

Stats displayed:
- Total questions attempted / total available
- Average score (all time)
- Scores over time (simple line chart)
- Weakest categories (lowest avg score)
- Current streak (days practiced consecutively)

---

## Environment & Configuration

`.env.local`:
```
OPENAI_API_KEY=sk-...
```

Timer default (45 min) is configurable per-question via the question card UI before starting.

---

## Out of Scope

- User authentication (single-user, local only)
- Multi-player / sharing
- Mobile app
- Audio/video interview simulation
