import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getDb, schema } from "./index";

// Seeds scam_types from data/playbook/*.json (docs/05 section 4). Requires DATABASE_URL.
interface PlaybookFile {
  id: string;
  name_en: string;
  name_sw: string;
}

async function main() {
  const dir = join(process.cwd(), "data", "playbook");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "contacts.json");
  const db = getDb();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as PlaybookFile;
    await db
      .insert(schema.scamTypes)
      .values({ id: raw.id, nameEn: raw.name_en, nameSw: raw.name_sw, playbook: raw })
      .onConflictDoUpdate({ target: schema.scamTypes.id, set: { nameEn: raw.name_en, nameSw: raw.name_sw, playbook: raw } });
  }
  console.log(`seeded ${files.length} scam types`);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : "seed failed");
  process.exit(1);
});
