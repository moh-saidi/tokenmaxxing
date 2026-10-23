import csv
import json
import re
import statistics
from pathlib import Path

import tiktoken

root = Path(__file__).parent
tasks = {t["id"]: t for t in json.loads((root / "tasks.json").read_text(encoding="utf-8"))}
enc = tiktoken.get_encoding("cl100k_base")


def norm(text):
    return text.encode("ascii", "ignore").decode("ascii")


def split_code(text):
    blocks = re.findall(r"```[a-zA-Z0-9_-]*\n(.*?)```", text, flags=re.S)
    code = "\n".join(blocks)
    prose = re.sub(r"```[a-zA-Z0-9_-]*\n.*?```", "", text, flags=re.S)
    return prose, code


rows = []
for path in sorted((root / "results" / "raw").glob("*.txt")):
    m = re.match(r"(.+)__(baseline|caveman|tokenmaxxing)__(\d+)\.txt$", path.name)
    if not m:
        continue
    task_id, agent, run = m.group(1), m.group(2), int(m.group(3))
    text = norm(path.read_text(encoding="utf-8", errors="replace")).strip()
    prose, code = split_code(text)
    rows.append({
        "task": task_id,
        "category": tasks[task_id]["category"],
        "agent": agent,
        "run": run,
        "tokens": len(enc.encode(text)),
        "words": len(text.split()),
        "prose_tokens": len(enc.encode(prose)),
        "code_tokens": len(enc.encode(code)),
    })


def avg(vals):
    return round(statistics.mean(vals), 1) if vals else 0


print("PER TASK (mean across runs)")
print(f"{'task':10} {'cat':9} {'agent':14} {'tokens':>7} {'words':>7} {'prose':>7} {'code':>7}")
for task_id in tasks:
    for agent in ("baseline", "caveman", "tokenmaxxing"):
        sel = [r for r in rows if r["task"] == task_id and r["agent"] == agent]
        if not sel:
            continue
        print(f"{task_id:10} {tasks[task_id]['category']:9} {agent:14} {avg([r['tokens'] for r in sel]):>7} {avg([r['words'] for r in sel]):>7} {avg([r['prose_tokens'] for r in sel]):>7} {avg([r['code_tokens'] for r in sel]):>7}")

with (root / "results" / "token-counts.csv").open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["task", "category", "agent", "runs", "mean_tokens", "mean_prose_tokens", "mean_code_tokens", "mean_words"])
    for task_id in tasks:
        for agent in ("baseline", "caveman", "tokenmaxxing"):
            sel = [r for r in rows if r["task"] == task_id and r["agent"] == agent]
            if sel:
                writer.writerow([
                    task_id,
                    tasks[task_id]["category"],
                    agent,
                    len(sel),
                    avg([r["tokens"] for r in sel]),
                    avg([r["prose_tokens"] for r in sel]),
                    avg([r["code_tokens"] for r in sel]),
                    avg([r["words"] for r in sel]),
                ])

with (root / "results" / "savings.csv").open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["task", "category", "default_tokens", "caveman_tokens", "tokenmaxxing_tokens", "tm_vs_default_pct", "tm_vs_caveman_pct"])
    for task_id in tasks:
        vals = {}
        for agent in ("baseline", "caveman", "tokenmaxxing"):
            sel = [r["tokens"] for r in rows if r["task"] == task_id and r["agent"] == agent]
            vals[agent] = avg(sel)
        if vals["baseline"] and vals["caveman"]:
            writer.writerow([
                task_id,
                tasks[task_id]["category"],
                vals["baseline"],
                vals["caveman"],
                vals["tokenmaxxing"],
                round(100 * (vals["tokenmaxxing"] - vals["baseline"]) / vals["baseline"], 1),
                round(100 * (vals["tokenmaxxing"] - vals["caveman"]) / vals["caveman"], 1),
            ])
