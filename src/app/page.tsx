const pillars = [
  {
    title: "Interview-grade prompts",
    description:
      "Curated questions across scale, data, consistency, latency, and trade-off analysis.",
  },
  {
    title: "Structured AI critique",
    description:
      "Score answers on completeness, bottlenecks, failure modes, and reasoning depth.",
  },
  {
    title: "Deliberate review loop",
    description:
      "Track weak areas and resurface questions until your explanations become repeatable.",
  },
];

const workflow = [
  "Pick a system design prompt and set a timed session.",
  "Write the architecture, APIs, storage model, and scaling plan.",
  "Receive feedback on gaps, trade-offs, and missing failure handling.",
  "Review again later based on spaced repetition priority.",
];

const roadmap = [
  "Question bank with difficulty, category, and readiness filters.",
  "Practice screen with timer, answer workspace, and submission flow.",
  "Evaluation pipeline backed by OpenAI JSON responses.",
  "Progress dashboard for scores, weak categories, and due reviews.",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-cyan-100">
            AI-Coached Architecture Practice
          </div>
          <div className="space-y-4">
            <p className="max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Build a system design assistant that trains how you think, not just
              what you memorize.
            </p>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              This app is positioned as a focused practice environment for system
              design interviews: prompts, timed responses, AI review, and
              follow-up scheduling in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#roadmap"
              className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              View Build Plan
            </a>
            <a
              href="#workflow"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              See User Flow
            </a>
          </div>
        </div>

        <section className="panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
            Core Outcome
          </p>
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-100">Candidate signal</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                Clearer trade-offs
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Practice loop</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  Prompt → Answer → Review
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Retention model</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  SM-2 scheduling
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="panel p-6">
            <p className="text-lg font-semibold text-white">{pillar.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {pillar.description}
            </p>
          </article>
        ))}
      </section>

      <section id="workflow" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200/80">
            Workflow
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            What the assist experience should do
          </h2>
          <p className="max-w-xl text-base leading-7 text-slate-300">
            The product should stay tight around one job: helping someone
            rehearse a credible system design answer, diagnose what was weak, and
            come back to it later with better structure.
          </p>
        </div>
        <div className="grid gap-4">
          {workflow.map((step, index) => (
            <div key={step} className="panel flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">
                0{index + 1}
              </div>
              <p className="pt-1 text-sm leading-7 text-slate-200">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roadmap" className="panel overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-white/10 bg-white/5 p-8 lg:border-b-0 lg:border-r">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200/80">
              Build Plan
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Current repo direction
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The repo already has the core stack for a local-first trainer:
              Next.js, Prisma, SQLite, Jest, and an approved design spec. The
              next implementation steps are straightforward product work rather
              than setup.
            </p>
          </div>
          <div className="p-8">
            <div className="grid gap-4">
              {roadmap.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-sm leading-7 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
