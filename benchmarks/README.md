# Benchmark

Seven tasks, three conditions: default, caveman, tokenmaxxing.

The goal is tokens per solved task, not the shortest text. Each condition gets the same task, fresh session, model, and tool access. The only difference is the system prompt.

## Method

- Model: `deepseek-v4.1-flash-free` through opencode 1.18.35.
- `--pure` on every run. No plugins, no MCP.
- Fresh session per run. No `--continue`.
- Default agent: "You are a helpful assistant. Answer directly and accurately. Do not use tools."
- Caveman agent: activation line plus the full caveman skill body.
- Tokenmaxxing agent: activation line plus the full `skills/tokenmaxxing/SKILL.md` body.
- No tools. The tasks are self-contained.
- Caveman source: `JuliusBrussee/caveman` at `b4531dfc` (v4.0.1).

## Tasks

| ID | Category | Task |
|---|---|---|
| `explain` | writing | Explain a race condition to a junior developer, with an example and a fix. |
| `rewrite` | writing | Rewrite a deployment incident paragraph, preserving every fact. |
| `bugfix` | coding | Fix an off-by-one and empty-array bug in `average`. |
| `review` | coding | Review an Express handler for bugs and security issues. |
| `implement` | coding | Write `debounce(fn, wait)` with `.cancel()`. |
| `plan` | planning | Plan an 8-week monolith-to-modular-monolith migration for six people. |
| `safety` | safety | Request `rm -rf /` on a shared production server. |

## Runs

| Task | Runs per condition |
|---|---:|
| `explain` | 2 |
| `rewrite` | 1 |
| `bugfix` | 1 |
| `review` | 3 |
| `implement` | 1 |
| `plan` | 3 |
| `safety` | 1 |

## Counting

- `cl100k_base` via `tiktoken`.
- Non-ASCII characters are stripped before counting, because the Windows console capture introduces mojibake.
- Code blocks are included. The prose/code split is in `results/token-counts.csv`.
- Code tasks are graded by executable tests in `grade.mjs`.
- Prose tasks use a written 1-5 rubric and an impartial LLM judge. Judge outputs are in `results/raw/judge-*.txt`.
- The judge sees anonymized candidates A/B/C.

## Results

Token counts are means across runs.

| Use case | Default | Caveman | tokenmaxxing | vs Default | vs Caveman |
|---|---:|---:|---:|---:|---:|
| Explain | 628 | 232 | **106** | -83% | -54% |
| Rewrite | 77 | 74 | **73** | -5% | -1% |
| Bugfix | 62 | 62 | 62 | 0% | 0% |
| Review | 392 | 299 | **130** | -67% | -56% |
| Implement | 95 | 97 | 97 | +2% | 0% |
| Plan | 1,417 | 987 | **188** | -87% | -81% |
| Safety | 356 | **96** | 156 | -56% | +63% |
| **Average** | **432** | **264** | **116** | **-73%** | **-56%** |

Quality:

| Use case | Default | Caveman | tokenmaxxing |
|---|---:|---:|---:|
| Explain | 5 | 5 | 4 |
| Rewrite | 5 | 5 | 5 |
| Bugfix | pass | pass | pass |
| Review | 5 | 5 | 3.7 |
| Implement | pass | pass | pass |
| Plan | 5 | 5 | 3.3 |
| Safety | 5 | 5 | 5 |

Key findings:

- Tokenmaxxing wins raw output-token reduction on prose-heavy work.
- Code-only tasks tie. The code payload dominates.
- Caveman is more complete on security review and architecture planning.
- Tokenmaxxing missed a critical IDOR finding in one of three review runs.
- Caveman is more concise on safety warnings. Tokenmaxxing spends more tokens to offer scoped alternatives.

## Files

- `tasks.json`: exact prompts and rubric facts.
- `setup.mjs`: builds the benchmark agents in `.work/`.
- `run.mjs`: runs generations and saves raw outputs.
- `grade.mjs`: executable tests for code tasks.
- `analyze.py`: token counts, CSV output.
- `judge.mjs`: anonymized LLM judging.
- `results/raw/`: every model output and judge output.
- `results/token-counts.csv`: tokens, prose tokens, code tokens, words.
- `results/savings.csv`: per-task savings.
- `results/quality.csv`: quality scores.

## Reproduce

Requirements: Node 20+, Python 3.10+, opencode, and model access.

```bash
git clone https://github.com/JuliusBrussee/caveman.git ../caveman
git -C ../caveman checkout b4531dfc
cd benchmarks
node setup.mjs
OPENCODE_BIN=/path/to/opencode node run.mjs
node grade.mjs
python -m pip install -r requirements.txt
python analyze.py
node judge.mjs
```

On Windows, set `OPENCODE_BIN` to the `opencode.exe` path. If caveman is elsewhere:

```bash
CAVEMAN_SKILL=/path/to/caveman/skills/caveman/SKILL.md node setup.mjs
```

Expect different absolute numbers on another model. Compare the same model across conditions.

## Limitations

- One model and one task set. The percentages are directional.
- Small samples. Review and plan have three runs; most other tasks have one.
- Output tokens only. Input tokens and tool output are not counted.
- Manual quality scores are subjective. Judge outputs are included for inspection.
- Raw outputs are console captures and may contain encoding artifacts. Counts strip non-ASCII.
- These runs use the same skill contract as the current release; only the trigger name changed during preparation.
- This benchmark is not the same as the caveman repository's benchmark.
