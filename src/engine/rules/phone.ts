// Kenyan phone normalisation + extraction. Raw numbers are never stored; indicators hash them.
export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[\s()-]/g, "");
  if (/^\+254[17]\d{8}$/.test(d)) return d;
  if (/^254[17]\d{8}$/.test(d)) return `+${d}`;
  if (/^0[17]\d{8}$/.test(d)) return `+254${d.slice(1)}`;
  return null;
}

export function findPhones(text: string): string[] {
  const hits = text.match(/(?:\+254|254|0)[17]\d{8}\b/g) ?? [];
  return [...new Set(hits.map((h) => normalisePhone(h)).filter((h): h is string => h !== null))];
}

export function maskPhone(e164: string): string {
  return e164.length > 7 ? `${e164.slice(0, 4)}***${e164.slice(-3)}` : "***";
}
