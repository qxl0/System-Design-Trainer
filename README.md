# System Design Trainer

An interactive system design interview trainer built with Next.js, Prisma, SQLite, and OpenAI scoring.

Instead of acting like a static reading list, this repo turns system design prompts into a practice loop:

- browse questions by difficulty and category
- study model answers with Mermaid and ASCII diagrams
- answer prompts in practice mode
- get AI feedback and a score
- review questions with spaced repetition

## Why this is useful

Classic primer repos are strong on breadth, but they are mostly static reference material. This project adds:

- guided practice instead of passive reading
- answer evaluation and feedback
- study notes attached to individual prompts
- a review loop driven by progress and next-review dates

## Current content

The question bank includes classic interview prompts such as:

- URL shortener
- unique ID generator
- Twitter feed
- Instagram
- Google Drive / Dropbox
- web crawler
- personal finance tracker
- social graph service
- search query cache
- Amazon sales ranking by category
- plus several modern infrastructure, fintech, monitoring, and realtime topics

## Stack

- Next.js 14 app router
- React 18
- Prisma with SQLite
- Jest + Testing Library
- Mermaid for architecture diagrams
- OpenAI API for feedback generation

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` with at least:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your_api_key_here"
```

If `OPENAI_API_KEY` is missing, the evaluation flow will not work correctly.

### 3. Initialize the database

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run test
npm run test:watch
npm run test:coverage
npm run db:seed
npm run db:reset
```

## App flow

### Study mode

- browse the question bank
- filter by difficulty and category
- open a question to read the prompt, model answer, diagram, and notes

### Practice mode

- answer the prompt in free form
- submit for AI scoring
- review strengths, gaps, and an improvement tip

### Progress mode

- track completed questions
- review due items
- use spaced repetition to keep important patterns fresh

## Data model notes

Question metadata and rich study content live in `data/questions.ts`.

The database stores the persisted question records plus session and progress data:

- `Question`
- `Session`
- `Progress`

The app joins persisted questions with the richer seed data by title so study pages can render diagrams and notes.

## Good next improvements

If you want to keep pushing the repo, these are the highest-value follow-ups:

- persist `mermaidDiagram`, `asciiDiagram`, and `studyNotes` in Prisma instead of looking them up by title
- add an import/export path for question packs so the bank is easier to extend
- add a "question source" field to distinguish primer-style classics from original content
- improve README screenshots and demo GIFs
- add tests for API responses that include seed-backed study fields
- add frontend system design questions as a separate track
- support rubric-based manual scoring alongside AI scoring

## Testing

Run the test suite with:

```bash
npm run test
```

For targeted work on Mermaid rendering:

```bash
npm test -- --runInBand __tests__/components/MermaidDiagram.test.tsx
```

## License

Add a license file if you plan to publish or accept outside contributions.
