# Design

## Goal

Minimize output tokens per solved task without making the answer wrong.

Most brevity prompts compress tone. They remove greetings and filler, then stop. That leaves structural tokens untouched: restated context, recaps, rationale the reader did not ask for, decorative Markdown, narration between tool calls, and unnecessary tool output.

`tokenmaxxing` is an output contract. It sets a budget and a shape, then removes everything that does not change the answer.

## Contract

1. Answer first, then stop. No greeting, plan, recap, apology, or offer.
2. Hard budget: 80 prose words, 3 sentences for explanations, 5 bullets for reviews and plans. Code, commands, paths, errors, and quoted output are excluded.
3. No decoration: no headers, bold, tables, emoji, rules, or "Key points". Bullets only for 3 or more parallel items.
4. Delta only: no restated question, context, or unchanged code. Cite `path:line`.
5. Explain only when needed: actionable without rationale means no rationale. Cause matters means one sentence.
6. Retrieval discipline: search before read, narrow reads, batch independent calls, never re-read unchanged files.
7. Tool runs: no narration, no echoed output. One line before a multi-step run, one line after.
8. Payload verbatim: code, commands, paths, identifiers, numbers, units, negations, and exact errors are never compressed.
9. User's language: compress style, not language. Technical terms stay original.
10. No performance: no prefix, no "me smart", no normal answer plus terse copy.

## Caveman vs tokenmaxxing

| Dimension | Caveman | tokenmaxxing |
|---|---|---|
| Primary lever | Tone and grammar | Output structure and budget |
| Default shape | Answer, reason, next step | Answer, then stop |
| Length control | Sentence-level style | Hard prose caps |
| Markdown | No decorative tables or emoji | No headers, bold, tables, emoji, or rules |
| Tool narration | One line per phase | One line before and after |
| Retrieval | Not addressed | Search/narrow-read discipline |
| Code | Changed lines plus context | Same, plus delta-only |
| Safety | Plain prose for risky cases | Same, with minimum-span expansion |
| Activation cost | 1,166 tokens | 689 tokens |

The activation numbers are `cl100k_base` counts of the skill bodies. A smaller skill is not automatically better, but it means less of the savings are spent loading the rules.

## Why it saves tokens

- Removing "reason" and "next step" by default is the largest single cut. Caveman keeps both.
- Hard caps stop the model from drifting into a long explanation after a short answer.
- A decoration ban removes headers, bold, tables, and recaps that add tokens without adding facts.
- Delta-only output prevents restating code and context that is already in the conversation.
- Retrieval discipline reduces tool output, which is often a larger cost than the final answer.
- Safety expansion is narrow. The skill spends tokens only where a short answer would be unsafe or ambiguous.

## Tradeoffs

The benchmark shows the cost of compression:

- A code review can lose lower-severity findings. In one of three runs, `tokenmaxxing` missed a critical IDOR finding.
- A migration plan can become too thin to execute. The eight-week plan was 188 tokens vs 987 for caveman.
- Safety warnings are longer than caveman's because the skill offers scoped alternatives.

The intended split:

- `tokenmaxxing`: explanations, rewrites, status, routine coding, simple reviews.
- Caveman or plain prose: security review, architecture, destructive operations, ambiguous requirements, persisted text.

## Non-goals

- It does not compress code, commands, paths, identifiers, numbers, units, negations, or exact errors.
- It does not replace tests, static analysis, or human review.
- It does not optimize input tokens directly. It gives the agent retrieval habits that tend to reduce them.
- It does not write to files, run commands, or require dependencies.

## Tuning

- If answers are too terse to be correct, raise the prose budget or add a shape rule for the failing task type.
- If answers are still too long, cut rationale before cutting facts.
- If a task needs detail, expand the minimum span and resume the contract. Correctness beats budget.
