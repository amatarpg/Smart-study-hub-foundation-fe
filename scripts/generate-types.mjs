import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const openapiUrl =
  process.argv[2] ?? process.env.OPENAPI_URL ?? "http://localhost:8000/api/v1/openapi.json";
const outFile = join(root, "src/lib/api/generated.d.ts");

const res = await fetch(openapiUrl);
if (!res.ok) {
  console.error(`Gagal mengambil OpenAPI dari ${openapiUrl}: HTTP ${res.status}`);
  process.exit(1);
}
const spec = await res.json();
const { execFileSync } = await import("node:child_process");
const tmp = join(root, "node_modules/.tmp-openapi.json");
writeFileSync(tmp, JSON.stringify(spec));
mkdirSync(dirname(outFile), { recursive: true });
execFileSync(
  "npx",
  ["openapi-typescript", tmp, "-o", outFile],
  { cwd: root, stdio: "inherit" },
);
console.log(`Tipe OpenAPI ditulis ke ${outFile}`);
