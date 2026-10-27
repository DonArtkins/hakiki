// R01: M-Pesa transaction-code structure (docs/03 section 5).
// Encoding derived from a Kenyan press explainer, NOT Safaricom documentation: severity stays
// "medium" until validated against a real SMS (docs/SMOKE_TEST.md #6).
const YEAR_BASE = 2006; // A=2006 ... T=2025, U=2026 (docs/03 worked check: 2026-10-27 -> UJR)

export interface MpesaCodeResult {
  ok: boolean;
  reason: "format" | "date-range" | "date-invalid" | "future" | null;
  date: Date | null;
}

export function parseMpesaCode(code: string, now = new Date()): MpesaCodeResult {
  if (!/^[A-Z0-9]{10}$/.test(code)) return { ok: false, reason: "format", date: null };
  const year = YEAR_BASE + (code.charCodeAt(0) - 65);
  const month = code.charCodeAt(1) - 65; // A..L => 0..11
  const dch = code.charAt(2);
  const day = /[1-9]/.test(dch) ? Number(dch) : 10 + (dch.charCodeAt(0) - 65); // A=10 ... V=31
  if (month < 0 || month > 11 || day < 1 || day > 31) return { ok: false, reason: "date-range", date: null };
  const dt = new Date(Date.UTC(year, month, day));
  if (dt.getUTCMonth() !== month) return { ok: false, reason: "date-invalid", date: null };
  if (dt.getTime() > now.getTime()) return { ok: false, reason: "future", date: null };
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 3600 * 1000);
  if (dt.getTime() < twoYearsAgo.getTime()) return { ok: false, reason: "date-range", date: null };
  return { ok: true, date: dt, reason: null };
}

export function findMpesaCodes(text: string): string[] {
  const candidates = text.toUpperCase().match(/\b[A-Z0-9]{10}\b/g) ?? [];
  // A transaction code mixes letters and digits; a 10-digit phone number is not a code.
  return [...new Set(candidates.filter((c) => /[A-Z]/.test(c) && /\d/.test(c)))];
}
