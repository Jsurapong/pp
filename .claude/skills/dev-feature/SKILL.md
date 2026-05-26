---
name: dev-feature
description: Orchestrates a 6-agent team (PM, CTO, Frontend Dev, Backend Dev, QA, Doc Writer) to take a user's feature request from raw requirement to fully-tested, documented implementation. Use this whenever the user says things like "build a feature", "develop X", "implement Y", "พัฒนา feature", "ทำ feature", "สร้าง feature ใหม่", or describes a software feature they want to ship. Use it even when the user hasn't explicitly asked for "the dev-feature workflow" — any request describing a non-trivial feature to build should trigger this skill, because the multi-agent process produces dramatically more thorough requirements analysis, planning, implementation, and testing than a single pass.
---

# dev-feature

A 6-agent assembly-line that turns a feature idea into a built, tested, and documented feature. The agents are specialized subagents, each with a clear role and a clear file-based handoff to the next.

## When to use

Use this skill the moment the user describes a feature they want built. Signals:
- "Build / develop / implement / add / create" + a feature noun
- A user story ("As a user, I want to...")
- A bug-fix-as-feature ("make X work like Y")
- Any Thai equivalent: "ทำ / สร้าง / พัฒนา / เพิ่ม feature ..."

Do **not** use this skill for:
- Pure code questions ("how does this function work")
- One-line fixes
- Refactoring without behavior change
- Tasks that are clearly research / design only

## Agents at a glance

| # | Name   | Role             | Model     | Reads                                  | Writes                            |
|---|--------|------------------|-----------|----------------------------------------|-----------------------------------|
| 1 | dhrin  | Product Manager  | opus      | user's raw request                     | `requirement.md`                  |
| 2 | Aut    | CTO              | opus      | `requirement.md`                       | `requirement-discuss.md`, `fe-plan.md`, `be-plan.md`, `qa-plan.md` |
| 3 | Jay    | Frontend Dev     | sonnet    | `fe-plan.md` + codebase                | FE code + tests, `fe-implementation-summary.md` |
| 4 | Bow    | Backend Dev      | sonnet    | `be-plan.md` + codebase                | BE code + tests, `be-implementation-summary.md` |
| 5 | Max    | QA               | sonnet    | `qa-plan.md` + Jay's + Bow's outputs   | `test-report.md`                  |
| 6 | Beauty | Doc Writer       | haiku     | everything above                       | `release-note.md`                 |

Each agent has its full instructions in `.claude/skills/dev-feature/agents/<name>.md`. Read the relevant agent file before spawning that subagent — that's how the agent knows what to do.

## The workflow

```
                   ┌────────────────────────┐
   user request →  │  dhrin  (PM, opus)     │
                   └───────────┬────────────┘
                               │ requirement.md
                               ▼
                   ┌────────────────────────┐
                   │  Aut    (CTO, opus)    │
                   │  feasibility + plans   │
                   └─┬────┬────┬────┬───────┘
   (if not feasible) │    │    │    │
   ← back to dhrin ──┘    │    │    │
                          │    │    │
                  fe-plan │    │    │ qa-plan
                          │    │    │
                          ▼    ▼    ▼
                ┌─────────┐ ┌─────────┐ ┌─────────┐
                │ Jay (FE)│ │ Bow (BE)│ │ Max-A   │   ← run in PARALLEL
                │ +tests  │ │ +tests  │ │(design  │
                │         │ │         │ │ tests)  │
                └────┬────┘ └────┬────┘ └────┬────┘
                     └───────────┼───────────┘
                                 ▼
                       ┌─────────────────────┐
                       │ Max-B (verify)      │   ← runs AFTER Jay + Bow
                       │ test-report.md      │
                       └──────────┬──────────┘
                                  ▼
                       ┌─────────────────────┐
                       │ Beauty (docs, haiku)│
                       │ release-note.md     │
                       └─────────────────────┘
```

Key invariants:
- **Files are the contract.** Every handoff is a file in the feature folder. Never pass state in-memory between agents.
- **Aut can reject.** If Aut judges the requirement infeasible, the loop returns to dhrin with `requirement-discuss.md` as feedback. Do not proceed to implementation in that case.
- **Jay, Bow, and Max-A run in parallel.** They have no dependency on each other. Spawn them in the same turn.
- **Max has two phases.** Phase A (test design) runs alongside the devs. Phase B (verification) runs only after Jay and Bow have both finished.
- **Beauty is the last agent.** Beauty only runs after every other agent has finished writing their file.

## Folder layout

For every feature, create:

```
docs/dev-feature/<feature-slug>/
├── requirement.md                    ← dhrin
├── requirement-discuss.md            ← Aut (feedback on requirement)
├── fe-plan.md                        ← Aut → Jay
├── be-plan.md                        ← Aut → Bow
├── qa-plan.md                        ← Aut → Max
├── fe-implementation-summary.md      ← Jay
├── be-implementation-summary.md      ← Bow
├── test-report.md                    ← Max (Phase B)
└── release-note.md                   ← Beauty
```

`<feature-slug>` is a short kebab-case name derived from the feature, e.g. `user-profile-avatar`, `dark-mode-toggle`, `csv-export`.

## How to run the workflow

### Step 0: Set up the folder
Pick a `<feature-slug>` from the user's description. Create `docs/dev-feature/<feature-slug>/`. If the folder already exists, ask the user whether to resume (read existing files) or start fresh.

### Step 1: Run dhrin
Read `.claude/skills/dev-feature/agents/dhrin.md`. Spawn a subagent with **opus** as the model. Pass the user's raw request and the target file path. Wait for `requirement.md` to be written.

Show `requirement.md` to the user and ask: "Does this capture what you want? Any changes?" Loop with the user until they're happy. Only then proceed.

### Step 2: Run Aut
Read `.claude/skills/dev-feature/agents/aut.md`. Spawn a subagent with **opus** as the model. Pass the path to `requirement.md`.

Aut will produce `requirement-discuss.md` first. Open it.
- If Aut's verdict is **"feasible"** → Aut will also produce `fe-plan.md`, `be-plan.md`, `qa-plan.md`. Proceed.
- If Aut's verdict is **"not feasible"** or **"needs clarification"** → stop. Show the discussion to the user, route back to dhrin with the feedback, and re-run Step 1.

### Step 3: Run Jay + Bow + Max-A in parallel
Read `.claude/skills/dev-feature/agents/jay.md`, `.claude/skills/dev-feature/agents/bow.md`, and `.claude/skills/dev-feature/agents/max.md`. In a **single turn**, spawn three subagents:
- Jay (sonnet) reads `fe-plan.md`, writes FE code + tests, then `fe-implementation-summary.md`.
- Bow (sonnet) reads `be-plan.md`, writes BE code + tests, then `be-implementation-summary.md`.
- Max in Phase-A mode (sonnet) reads `qa-plan.md`, drafts concrete test cases (file output is internal scratch — Max keeps them for Phase B).

Before spawning Jay and Bow, give them context about the codebase (tech stack, existing patterns, file conventions). If you don't know, ask the user briefly.

### Step 4: Run Max Phase B
Once Jay and Bow have both finished, spawn Max again in **Phase-B mode** (sonnet). Pass the FE + BE summaries and the test cases Max drafted in Phase A. Max runs / verifies the tests and produces `test-report.md` with pass/fail per test.

If Max reports failures, surface them to the user and decide whether to loop back to Jay or Bow.

### Step 5: Run Beauty
Spawn Beauty (haiku) — read `.claude/skills/dev-feature/agents/beauty.md`. Beauty reads every other file in the feature folder and writes `release-note.md`: a clean, user-facing summary of what shipped, how to use it, and any caveats.

### Step 6: Hand back to user
Tell the user the feature is done, point them at `docs/dev-feature/<feature-slug>/release-note.md`, and offer to surface any of the intermediate docs.

## A worked example (mini)

User: "ทำ feature ให้ user อัปโหลด avatar ได้"

1. Slug: `user-avatar-upload`. Create `docs/dev-feature/user-avatar-upload/`.
2. dhrin → `requirement.md`: covers upload size limits, allowed types, where it shows up, default avatar fallback, edit/replace flow.
3. Aut → judges feasible. `requirement-discuss.md` notes one open question (storage backend); `fe-plan.md` (file picker, crop UI, optimistic update), `be-plan.md` (presigned URLs, image processing, DB column), `qa-plan.md` (happy path + 4 edge cases).
4. Jay + Bow + Max-A in parallel. Jay ships the React component + RTL tests. Bow ships the upload endpoint + Jest tests. Max-A drafts 7 concrete test scenarios.
5. Max-B runs the tests. `test-report.md`: 6 pass, 1 fail on oversized-file rejection. Loop back to Bow for fix. Re-run Max-B → all pass.
6. Beauty → `release-note.md`: ~half a page, screenshot suggestions, how-to.

## Notes on model choice

The model column in the agent table is a recommendation, not a hard rule. If a feature is small and obvious, you can downgrade dhrin and Aut to sonnet. If the feature is gnarly, you can upgrade Jay/Bow/Max to opus. Beauty almost never needs more than haiku — it's pure summarization.

## Why six agents and not one big prompt?

The point of this skill is the **separation of concerns**. A single prompt asking "design and build feature X with tests and docs" tends to under-think the requirement, over-couple FE and BE, and skimp on tests. Splitting the work forces each step to be inspected (by you and the user) before the next begins, and the file artifacts make the whole process auditable.

If you find yourself tempted to skip an agent ("dhrin is overkill for this"), pause. The reason this skill exists is to resist that temptation.
