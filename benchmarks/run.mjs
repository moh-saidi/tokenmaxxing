import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const work = resolve(root, ".work");
const results = resolve(root, "results", "raw");
const exe = process.env.OPENCODE_BIN || "opencode";
const tasks = JSON.parse(readFileSync(resolve(root, "tasks.json"), "utf8"));
const only = new Set(process.argv.slice(2));
const selected = only.size ? tasks.filter((t) => only.has(t.id)) : tasks;
const agents = ["baseline", "caveman", "tokenmaxxing"];
const runs = Number(process.env.RUNS || 1);
const offset = Number(process.env.RUN_OFFSET || 0);
const timeout = Number(process.env.TIMEOUT_MS || 180000);

mkdirSync(results, { recursive: true });

for (const task of selected) {
  for (const agent of agents) {
    for (let run = 1 + offset; run <= runs + offset; run++) {
      const started = Date.now();
      const res = spawnSync(exe, ["run", "--pure", "--agent", agent, task.prompt], {
        cwd: work,
        encoding: "utf8",
        timeout,
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      });
      const raw = (res.stdout || "").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").trim();
      const err = (res.stderr || "").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").trim();
      const label = `${task.id}__${agent}__${run}`;
      const text = raw || `[NO OUTPUT]\n${err}`;
      writeFileSync(resolve(results, `${label}.txt`), text + "\n", "utf8");
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`${label}\t${text.length} chars\t${secs}s\t${res.status}`);
      if (res.error) console.log(`  spawn error: ${res.error.message}`);
    }
  }
}
