import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = resolve(root, "skills", "tokenmaxxing", "SKILL.md");
const text = readFileSync(skillPath, "utf8");

const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!front) {
  console.error("SKILL.md: missing frontmatter");
  process.exit(1);
}

const name = front[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
const description = front[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();

if (name !== "tokenmaxxing") {
  console.error(`SKILL.md: name is "${name}", expected "tokenmaxxing"`);
  process.exit(1);
}
if (!description) {
  console.error("SKILL.md: missing description");
  process.exit(1);
}
if (!text.includes("# Tokenmaxxing")) {
  console.error("SKILL.md: missing body heading");
  process.exit(1);
}

console.log("SKILL.md: ok");
