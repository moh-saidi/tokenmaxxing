import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const repo = resolve(root, "..");
const skillPath = resolve(repo, "skills/tokenmaxxing/SKILL.md");
const cavemanPath = process.env.CAVEMAN_SKILL || resolve(repo, "../caveman/skills/caveman/SKILL.md");

if (!existsSync(skillPath)) {
  console.error(`Missing skill: ${skillPath}`);
  process.exit(1);
}
if (!existsSync(cavemanPath)) {
  console.error(`Missing caveman skill: ${cavemanPath}`);
  console.error("Set CAVEMAN_SKILL to the path of caveman's SKILL.md.");
  process.exit(1);
}

function body(path) {
  return readFileSync(path, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

const work = resolve(root, ".work");
mkdirSync(resolve(work, ".opencode", "agent"), { recursive: true });

const agents = {
  baseline: "You are a helpful assistant. Answer the user's request directly and accurately. Do not use tools.",
  caveman: "You are in caveman mode. Follow this contract for every reply. Do not use tools.\n\n" + body(cavemanPath),
  tokenmaxxing: "You are in tokenmaxxing mode. Follow this contract for every reply. Do not use tools.\n\n" + body(skillPath),
  judge: "You are an impartial evaluator. Compare candidate answers to the same task. Score each candidate 1-5 for correctness, completeness, and clarity. Ignore length and prose style unless they cause a factual error or make the answer unusable. Penalize missing critical facts. Do not use tools. Return only the requested score table and a one-line verdict.",
};

for (const [name, prompt] of Object.entries(agents)) {
  const text = `---\ndescription: Benchmark ${name} agent\nmode: primary\nmodel: opencode/deepseek-v4.1-flash-free\n---\n\n${prompt}\n`;
  writeFileSync(resolve(work, ".opencode", "agent", `${name}.md`), text, "utf8");
}

console.log(`wrote benchmark agents to ${work}`);
