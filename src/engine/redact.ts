import { maskPhone, normalisePhone } from "./rules/phone";

// Runs on model reason text before ANY persist or log (SDR-006/R3). Paraphrase is the first
// defence; this regex mask is the second. Never applied to stored data that is already hashed.
const PHONE_RE = /(?:\+254|254|0)[17]\d{8}\b/g;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const ID_RE = /\b\d{7,8}\b/g; // Kenyan national ID shape; conservative, context-free

export function redact(text: string): string {
  return text
    .replace(PHONE_RE, (m) => {
      const n = normalisePhone(m);
      return n ? maskPhone(n) : "***";
    })
    .replace(EMAIL_RE, "***@***")
    .replace(ID_RE, "***");
}
