// Next's static export writes route prefetch files into nested folders
// (shop/__next.shop/__PAGE__.txt) but the browser asks for them with dots
// (shop/__next.shop.__PAGE__.txt). Copy each one to the dotted name so plain
// static hosting serves them instead of returning 404.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let copied = 0;

function flatten(dir, base, prefix) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) flatten(full, base, `${prefix}.${name}`);
    else { copyFileSync(full, join(base, `${prefix}.${name}`)); copied++; }
  }
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(full, dir, name);
    else if (name !== "_next") walk(full);
  }
}

walk("out");
console.log(`Prefetch files flattened: ${copied}`);
