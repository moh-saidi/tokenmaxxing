# tokenmaxxing

> Fewest tokens that still solve the task.

A maximum-compression skill for coding agents. It is an output contract, not a voice: answer first, hard caps, no decoration, delta-only edits, retrieval discipline, payload preserved.

Ships with the benchmark used to compare it with [caveman](https://github.com/JuliusBrussee/caveman) and a default agent.

## Install

### npx skills

```bash
npx skills@latest add moh-saidi/tokenmaxxing --skill tokenmaxxing
```

Global install:

```bash
npx skills@latest add moh-saidi/tokenmaxxing --skill tokenmaxxing --global
```

List the skills in this repo:

```bash
npx skills@latest add moh-saidi/tokenmaxxing --list
```

Non-interactive global install for Codex:

```bash
npx skills@latest add moh-saidi/tokenmaxxing --skill tokenmaxxing --agent codex --global --yes
```

Maintain installed skills with the same CLI:

```bash
npx skills list
npx skills update
npx skills remove tokenmaxxing
```

### opencode

Global:

```text
Copy skills/tokenmaxxing to ~/.config/opencode/skills/tokenmaxxing
Restart opencode.
```

Or point opencode at this repo's `skills` directory:

```json
{
  "skills": {
    "paths": ["/absolute/path/to/tokenmaxxing/skills"]
  }
}
```

### Claude Code

```bash
cp -r skills/tokenmaxxing ~/.claude/skills/tokenmaxxing
```

Restart the agent.

## Use

Say `tokenmaxxing`, `be brief`, `less tokens`, `token diet`, `terse`, or `short answers`.

- `tokenmaxxing max` halves the prose budgets, allows fragments, and drops rationale.
- `normal mode` or `stop tokenmaxxing` turns it off.

## What it does

- Answer first, then stop. No greeting, plan, recap, apology, or offer.
- Hard budget: 80 prose words per reply, 3 sentences for explanations, 5 bullets for reviews and plans. Code, commands, paths, errors, and quoted output are excluded.
- No headers, bold, tables, emoji, rules, or "Key points". Bullets only for 3 or more parallel items.
- Delta-only: never restates the question, context, or unchanged code. Cites `path:line`.
- Retrieval discipline: search before reading, read the narrowest range, batch independent calls, never re-read unchanged files.
- Payload verbatim: code, commands, paths, identifiers, numbers, units, negations, and exact errors are never compressed.
- Expands for security warnings, irreversible actions, ambiguous requirements, persisted text, and confused users.

## Benchmark

Measured on 7 tasks with `deepseek-v4.1-flash-free`, fresh session per run, `cl100k_base` token counts.

| Use case | Default | Caveman | tokenmaxxing | vs Default | vs Caveman |
|---|---:|---:|---:|---:|---:|
| Explain concept | 628 | 232 | 106 | -83% | -54% |
| Rewrite text | 77 | 74 | 73 | -5% | -1% |
| Fix bug | 62 | 62 | 62 | 0% | 0% |
| Code review | 392 | 299 | 130 | -67% | -56% |
| Implement function | 95 | 97 | 97 | +2% | 0% |
| Migration plan | 1,417 | 987 | 188 | -87% | -81% |
| Safety warning | 356 | 96 | 156 | -56% | +63% |
| Average | 432 | 264 | 116 | -73% | -56% |

Full quality scores, method, raw outputs, and limitations are in [`benchmarks/`](benchmarks/).

## Repo layout

```text
skills/tokenmaxxing/SKILL.md   the skill
docs/DESIGN.md                 design notes
benchmarks/                    tasks, harness, raw outputs, results
scripts/validate.mjs           frontmatter check for CI
.github/workflows/validate.yml CI validation
```

## Caveats

- One model, one task set, small sample. Treat the percentages as directional.
- The benchmark measures output tokens, not total session cost. Input tokens and tool output vary by agent.
- The skill is text only. It runs no code and needs no dependencies.
- It is not a replacement for tests, security review, or judgment.
