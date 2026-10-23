import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = dirname(fileURLToPath(import.meta.url));
const results = resolve(root, "results", "raw");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function codeOf(text) {
  const m = text.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
}

function evalCode(code, names) {
  const ctx = vm.createContext({ setTimeout, clearTimeout, console });
  const value = vm.runInContext(`${code}\n;({${names.join(",")}})`, ctx, { timeout: 1000 });
  return { value, ctx };
}

async function testAverage(code) {
  const { value } = evalCode(code, ["average"]);
  const average = value.average;
  if (typeof average !== "function") return "no function";
  if (average([2, 4]) !== 3) return "average([2,4]) != 3";
  if (average([]) !== 0) return "average([]) != 0";
  if (average([1, 2, 3]) !== 2) return "average([1,2,3]) != 2";
  return "pass";
}

async function testDebounce(code) {
  const { value } = evalCode(code, ["debounce"]);
  const debounce = value.debounce;
  if (typeof debounce !== "function") return "no function";

  const calls = [];
  const d = debounce((...args) => calls.push(args), 25);
  d(1);
  d(2);
  await sleep(70);
  if (calls.length !== 1) return `coalesce count ${calls.length}`;
  if (calls[0][0] !== 2) return "last args lost";

  const obj = { v: 0, f: debounce(function (x) { this.v += x; }, 25) };
  obj.f(5);
  await sleep(70);
  if (obj.v !== 5) return `this lost: ${obj.v}`;

  const canceled = [];
  const c = debounce(() => canceled.push(1), 25);
  c();
  c.cancel();
  await sleep(70);
  if (canceled.length !== 0) return "cancel failed";
  return "pass";
}

for (const file of readdirSync(results).filter((f) => f.endsWith(".txt"))) {
  const m = file.match(/^(bugfix|implement)__(baseline|caveman|tokenmaxxing)__(\d+)\.txt$/);
  if (!m) continue;
  const [, task, agent, run] = m;
  const code = codeOf(readFileSync(join(results, file), "utf8"));
  const result = task === "bugfix" ? await testAverage(code) : await testDebounce(code);
  console.log(`${task}\t${agent}\t${run}\t${result}`);
}
