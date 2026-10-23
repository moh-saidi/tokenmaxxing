import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const work = resolve(root, ".work");
const raw = resolve(root, "results", "raw");
const exe = process.env.OPENCODE_BIN || "opencode";
const tasks = JSON.parse(readFileSync(resolve(root, "tasks.json"), "utf8"));
const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
const maps = {
  explain: { A: "caveman", B: "tokenmaxxing", C: "baseline" },
  rewrite: { A: "tokenmaxxing", B: "baseline", C: "caveman" },
  review: { A: "baseline", B: "caveman", C: "tokenmaxxing" },
  plan: { A: "caveman", B: "tokenmaxxing", C: "baseline" },
  safety: { A: "tokenmaxxing", B: "baseline", C: "caveman" },
};

for (const [taskId, map] of Object.entries(maps)) {
  const task = byId[taskId];
  const parts = [
    `TASK:\n${task.prompt}`,
    "Score each candidate 1-5 for correctness, completeness, and clarity. Penalize missing critical facts. Ignore length and style unless they cause a factual error or make the answer unusable. Return exactly:",
    "A correctness=? completeness=? clarity=?",
    "B correctness=? completeness=? clarity=?",
    "C correctness=? completeness=? clarity=?",
    "Verdict: <one line naming the best candidate and why>",
  ];
  for (const label of ["A", "B", "C"]) {
    const agent = map[label];
    const text = readFileSync(join(raw, `${taskId}__${agent}__1.txt`), "utf8");
    parts.push(`CANDIDATE ${label}:\n${text.trim()}`);
  }
  const prompt = parts.join("\n\n");
  const res = spawnSync(exe, ["run", "--pure", "--agent", "judge", prompt], {
    cwd: work,
    encoding: "utf8",
    timeout: 180000,
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });
  const out = (res.stdout || "").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").trim();
  writeFileSync(join(raw, `judge-${taskId}.txt`), out + "\n", "utf8");
  console.log(`judge-${taskId}\t${out.length} chars\t${res.status}`);
}
