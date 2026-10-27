import { createHmac } from "node:crypto";
import { normalisePhone } from "./rules/phone";
import { registrableHost } from "./rules/url";

// Community indicators (SDR-007/R1): only HMAC hashes are stored. The pepper comes from env and
// never rotates without a migration. Counts become visible at >=3 reports AND >=2 devices.
export type IndicatorKind = "phone" | "url_host" | "mpesa_code_pattern" | "sender" | "paybill_till";

export function normaliseIndicator(kind: IndicatorKind, raw: string): string {
  switch (kind) {
    case "phone":
      return normalisePhone(raw) ?? raw.trim();
    case "url_host":
      return registrableHost(raw) ?? raw.trim().toLowerCase();
    case "mpesa_code_pattern":
      return raw.trim().toUpperCase().slice(0, 3);
    default:
      return raw.trim().toLowerCase();
  }
}

export function hashIndicator(kind: IndicatorKind, raw: string, pepper: string): string {
  return createHmac("sha256", pepper).update(`${kind}|${normaliseIndicator(kind, raw)}`).digest("hex");
}

export interface CommunityCount {
  reports: number;
  devices: number;
}

export function communityVisible(c: CommunityCount): boolean {
  return c.reports >= 3 && c.devices >= 2;
}
