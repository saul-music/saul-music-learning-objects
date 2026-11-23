// Escribe dist/lessons.json después del build de Vite. Uso: node scripts/lessons-json.mjs [carpeta]
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lessonsCatalog } from "../src/catalog.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = process.argv[2] ?? join(root, "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "lessons.json"), `${JSON.stringify(lessonsCatalog())}\n`);
console.log(`lessons.json escrito en ${dist}`);
