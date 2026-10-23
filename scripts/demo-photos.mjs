// Indexes the test photos in public/demo/<slug>/ into src/lib/data/demo-photos.json.
// Demo listings with placeholder photos show these instead (src/lib/repo.ts).
//   npm run db:demo-photos
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "public/demo";
const OUT = "src/lib/data/demo-photos.json";
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;
const MAX_PHOTOS = 6;
const MAX_BYTES = 1024 * 1024;

const index = {};
const warnings = [];

for (const slug of readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory()).sort()) {
  const files = readdirSync(join(ROOT, slug))
    .filter((f) => IMAGE.test(f))
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
  for (const f of files) {
    const size = statSync(join(ROOT, slug, f)).size;
    if (size > MAX_BYTES) warnings.push(`${slug}/${f} pesa ${(size / 1024 / 1024).toFixed(1)} MB; conviene bajarla a menos de 1 MB.`);
  }
  if (files.length > MAX_PHOTOS) warnings.push(`${slug}: tiene ${files.length} fotos; solo se usan las primeras ${MAX_PHOTOS}.`);
  const used = files.slice(0, MAX_PHOTOS);
  if (used.length) index[slug] = used.map((f) => `/demo/${slug}/${encodeURIComponent(f)}`);
}

writeFileSync(OUT, `${JSON.stringify(index, null, 2)}\n`);
const empty = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory() && !index[d]);
console.log(`${Object.keys(index).length} objetos con fotos → ${OUT}`);
if (empty.length) console.log(`  sin fotos: ${empty.join(", ")}`);
for (const w of warnings) console.log(`  aviso: ${w}`);
