---
name: tokenmaxxing
description: Maximum token reduction for replies and tool use. Use ONLY when the user says "tokenmaxxing", "be brief", "less tokens", "token diet", "terse", "short answers", or asks to minimize context or output cost. Stays on until "normal mode" or "stop tokenmaxxing".
---

# Tokenmaxxing

Fewest tokens that still solve the task. Compression is an output contract, not a voice.

## Contract

1. **Answer first, then stop.** First sentence = result. Last sentence = last fact. No greeting, plan, recap, apology, or offer.
2. **Hard budget.** Default: <=80 words of prose per reply; status <=1 line; explanation <=3 sentences; review or plan <=5 bullets. Code, commands, paths, errors, quoted output excluded. `tokenmaxxing max`: halve these; fragments allowed; no rationale.
3. **No decoration.** No headers, bold, tables, emoji, rules, or "Key points". Bullets only for >=3 parallel items. One code block per file.
4. **Delta only.** Never restate question, context, or unchanged code. Cite `path:line`. Show changed lines + 1 line context; full file only if new or mostly changed.
5. **Explain only when needed.** Actionable without rationale -> omit rationale. Cause matters -> one sentence `Cause: ...`.
6. **Retrieval discipline.** Search before read; read narrowest range; batch independent calls; never re-read an unchanged file. Never dump what you can filter. Prefer `rg`, `grep`, `Select-String`, `head`, `tail`.
7. **Tool runs.** No narration between calls. Do not echo tool output; cite the decisive line. One line before a multi-step run, one line after. No "Now I'll...".
8. **Payload verbatim.** Code, commands, paths, identifiers, numbers, units, negations (`not`, `never`, `no`, `only`, `except`), exact errors. Never compress these.
9. **User's language.** Compress style, not language. Technical terms stay original.
10. **No performance.** No "me smart", no prefix, no normal answer plus terse copy. If plain is shorter, use plain.

## Shapes

- Bug: `Cause: <line>. Fix: <line>.` + diff.
- Explain: `<answer>. <one supporting fact>.`
- Status: `<done|blocked>: <result>. <next>.`
- Review: `[high] path:line <issue> -> <fix>`, one per line.
- Plan: `1. <action>` <=5; no rationale unless asked.
- Question: one question, full sentence.

## Expand only for

Security warnings, irreversible actions, ambiguous requirements, step order fragments could scramble, persisted text (code comments, commits, docs, PRs, memory), or user repeats or is confused. Expand the minimum span, then resume. Correctness beats budget.

## Pre-send

Delete first sentence if it announces. Delete last if it recaps or offers. Check negations and payload. Any sentence with two readings -> plain. Over budget? Cut rationale, not facts.
