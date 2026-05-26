#!/usr/bin/env node
/**
 * sync-design — fetch latest Claude Design bundle and update design system tokens
 *
 * Usage:
 *   npm run sync-design
 *   npm run sync-design -- --url="https://api.anthropic.com/v1/design/h/NEW_ID?open_file=..."
 *
 * What it does:
 *   1. Fetches the design bundle (tar.gz) from Claude Design
 *   2. Extracts the :root { } CSS variables from antd.css
 *   3. Overwrites src/design-system/css-variables.css
 *   4. Prints a diff summary so you can review what changed
 */

import { execSync } from "child_process";
import { createWriteStream, readFileSync, writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Writable } from "stream";
import { pipeline } from "stream/promises";
import { createGunzip } from "zlib";
import { extract } from "tar";

// ── Config ──────────────────────────────────────────────────────────────────

const DEFAULT_URL =
  "https://api.anthropic.com/v1/design/h/K4LHfUzCcNr1vwrSXUjn-Q?open_file=BO_DA+Dashboard+-+Ant+Design.html";

const OUT_CSS = new URL(
  "../src/design-system/css-variables.css",
  import.meta.url
).pathname;

// ── Parse args ───────────────────────────────────────────────────────────────

const urlArg = process.argv.find((a) => a.startsWith("--url="));
const designUrl = urlArg ? urlArg.split("=").slice(1).join("=") : DEFAULT_URL;

// ── Fetch + extract ──────────────────────────────────────────────────────────

console.log("🔄  Fetching design bundle…");
console.log("    " + designUrl + "\n");

const res = await fetch(designUrl);
if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

const tmpDir = join(tmpdir(), "trademaster-design-" + Date.now());
mkdirSync(tmpDir, { recursive: true });

await pipeline(res.body, createGunzip(), extract({ cwd: tmpDir }));

console.log("✅  Bundle extracted to", tmpDir);

// ── Find antd.css in the bundle ──────────────────────────────────────────────

let antdCss;
try {
  // Try common locations in the bundle
  const candidates = [
    join(tmpDir, "boda-jay/project/antd.css"),
    join(tmpDir, "project/antd.css"),
  ];
  for (const p of candidates) {
    try { antdCss = readFileSync(p, "utf8"); break; } catch {}
  }
  if (!antdCss) throw new Error("antd.css not found in bundle");
} catch (e) {
  console.error("❌  Could not find antd.css in bundle:", e.message);
  process.exit(1);
}

// ── Extract :root { } block ──────────────────────────────────────────────────

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

// ── Diff + write ─────────────────────────────────────────────────────────────

let oldCss = "";
try { oldCss = readFileSync(OUT_CSS, "utf8"); } catch {}

if (oldCss === newCss) {
  console.log("✅  css-variables.css is already up to date — no changes.");
  process.exit(0);
}

// Simple line diff summary
const oldVars = [...oldCss.matchAll(/--[\w-]+:\s*([^;]+);/g)].map((m) => m[0].trim());
const newVars = [...newCss.matchAll(/--[\w-]+:\s*([^;]+);/g)].map((m) => m[0].trim());

const added   = newVars.filter((v) => !oldVars.includes(v));
const removed = oldVars.filter((v) => !newVars.includes(v));

if (added.length)   console.log(`\n+ Added (${added.length}):\n` +   added.map((v) => "  + " + v).join("\n"));
if (removed.length) console.log(`\n- Removed (${removed.length}):\n` + removed.map((v) => "  - " + v).join("\n"));

writeFileSync(OUT_CSS, newCss, "utf8");
console.log(`\n✅  src/design-system/css-variables.css updated (${added.length} added, ${removed.length} removed)`);
console.log("\n⚠️   Review changes above, then update tokens.ts and antd-theme.ts if values changed.");
console.log("    Run: git diff src/design-system/\n");
