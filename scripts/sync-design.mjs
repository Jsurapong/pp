#!/usr/bin/env node
/**
 * sync-design — fetch latest Claude Design bundle and update design system tokens
 *
 * Usage:
 *   npm run sync-design
 *   npm run sync-design -- --url="https://api.anthropic.com/v1/design/h/NEW_ID?open_file=..."
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// ── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_URL =
  "https://api.anthropic.com/v1/design/h/K4LHfUzCcNr1vwrSXUjn-Q?open_file=BO_DA+Dashboard+-+Ant+Design.html";

const OUT_CSS = new URL(
  "../src/design-system/css-variables.css",
  import.meta.url
).pathname;

// ── Parse args ───────────────────────────────────────────────────────────────

const urlArg = process.argv.find((a) => a.startsWith("--url="));
const designUrl = urlArg ? urlArg.split("=").slice(1).join("=") : DEFAULT_URL;

// ── Fetch bundle ─────────────────────────────────────────────────────────────

console.log("🔄  Fetching design bundle…");
console.log("    " + designUrl + "\n");

const res = await fetch(designUrl);
if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

const tmpDir = join(tmpdir(), "trademaster-design-" + Date.now());
mkdirSync(tmpDir, { recursive: true });

const bundlePath = join(tmpDir, "bundle.tar.gz");
const buffer = Buffer.from(await res.arrayBuffer());
writeFileSync(bundlePath, buffer);

execSync(`tar -xzf "${bundlePath}" -C "${tmpDir}"`);
console.log("✅  Bundle extracted");

// ── Find antd.css ─────────────────────────────────────────────────────────────

let antdCss;
const candidates = [
  join(tmpDir, "boda-jay/project/antd.css"),
  join(tmpDir, "project/antd.css"),
];
for (const p of candidates) {
  try { antdCss = readFileSync(p, "utf8"); break; } catch {}
}

// Fallback: search recursively
if (!antdCss) {
  try {
    const found = execSync(`find "${tmpDir}" -name "antd.css" | head -1`).toString().trim();
    if (found) antdCss = readFileSync(found, "utf8");
  } catch {}
}

if (!antdCss) {
  console.error("❌  antd.css not found in bundle");
  process.exit(1);
}

// ── Extract :root block ───────────────────────────────────────────────────────

const rootMatch = antdCss.match(/:root\s*\{([^}]+)\}/);
if (!rootMatch) {
  console.error("❌  No :root block found in antd.css");
  process.exit(1);
}

const newCss = `/**
 * CSS Custom Properties — synced from Claude Design bundle
 * Source: ${designUrl.split("?")[0]}
 * Last synced: ${new Date().toISOString()}
 *
 * This file is auto-updated by \`npm run sync-design\`.
 * Do not edit by hand — changes will be overwritten on next sync.
 */
:root {${rootMatch[1]}}
`;

// ── Diff + write ──────────────────────────────────────────────────────────────

let oldCss = "";
try { oldCss = readFileSync(OUT_CSS, "utf8"); } catch {}

const oldVars = [...oldCss.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]);
const newVars = [...newCss.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]);

const oldMap = Object.fromEntries(oldVars);
const newMap = Object.fromEntries(newVars);

const changed = newVars.filter(([k, v]) => oldMap[k] && oldMap[k] !== v);
const added   = newVars.filter(([k]) => !oldMap[k]);
const removed = oldVars.filter(([k]) => !newMap[k]);

if (changed.length === 0 && added.length === 0 && removed.length === 0) {
  console.log("✅  css-variables.css is already up to date — no changes.");
  process.exit(0);
}

if (changed.length) {
  console.log(`\n~ Changed (${changed.length}):`);
  changed.forEach(([k, v]) => console.log(`  ~ --${k}: ${oldMap[k]}  →  ${v}`));
}
if (added.length) {
  console.log(`\n+ Added (${added.length}):`);
  added.forEach(([k, v]) => console.log(`  + --${k}: ${v}`));
}
if (removed.length) {
  console.log(`\n- Removed (${removed.length}):`);
  removed.forEach(([k]) => console.log(`  - --${k}: ${oldMap[k]}`));
}

writeFileSync(OUT_CSS, newCss, "utf8");
console.log(`\n✅  src/design-system/css-variables.css updated`);

if (changed.length) {
  console.log("\n⚠️   Token values changed — update tokens.ts and antd-theme.ts to match:");
  changed.forEach(([k, v]) => console.log(`     --${k}: ${v}`));
}
console.log();
