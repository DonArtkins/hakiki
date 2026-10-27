import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../env";
import * as schema from "./schema";

// Lazy singleton: importing this module never requires a live database (tests, evals, CLI).
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  const url = env().DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  db ??= drizzle(neon(url), { schema });
  return db;
}

export function dbConfigured(): boolean {
  return Boolean(env().DATABASE_URL);
}
export { schema };
