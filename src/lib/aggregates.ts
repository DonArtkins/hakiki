export interface CheckRow { id: string; risk: string; scamTypeId: string | null; language: string; createdAt: string }

export function countByRisk(rows: CheckRow[]): Record<string, number> {
  const out: Record<string, number> = { safe: 0, suspicious: 0, high: 0, unclear: 0 };
  for (const r of rows) out[r.risk] = (out[r.risk] ?? 0) + 1;
  return out;
}
export function checksPerDay(rows: CheckRow[]): Array<{ day: string; count: number }> {
  const map = new Map<string, number>();
  for (const r of rows) { const day = r.createdAt.slice(0, 10); map.set(day, (map.get(day) ?? 0) + 1); }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([day, count]) => ({ day, count }));
}
export function countByType(rows: CheckRow[]): Array<{ type: string; count: number }> {
  const map = new Map<string, number>();
  for (const r of rows) { const k = r.scamTypeId ?? "unknown"; map.set(k, (map.get(k) ?? 0) + 1); }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));
}
export function serviceStatus(health: { ok: boolean; model: boolean; db: boolean } | null): "working" | "limited" {
  return health?.ok && health.model && health.db ? "working" : "limited";
}
export function summary(rows: CheckRow[]) {
  const by = countByRisk(rows);
  return { total: rows.length, high: by.high ?? 0, suspicious: by.suspicious ?? 0, safe: by.safe ?? 0, unclear: by.unclear ?? 0, latest: rows[0]?.createdAt ?? null };
}
