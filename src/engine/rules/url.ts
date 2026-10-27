// R07: static URL shape analysis. No network, ever (tool and rule are pure).
const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rb.gy", "cutt.ly", "shorturl.at"]);
const RISKY_TLDS = new Set(["xyz", "top", "click", "loan", "buzz", "work", "live"]);
const LOOKALIKE_TARGETS = ["safaricom", "mpesa", "m-pesa", "kra", "ecitizen", "equitybank", "kcb"];

export interface UrlShape {
  host: string;
  suspicious: boolean;
  reasons: string[];
}

export function registrableHost(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function checkUrlShape(rawUrl: string): UrlShape {
  const host = registrableHost(rawUrl) ?? "";
  const reasons: string[] = [];
  if (!host) return { host, suspicious: true, reasons: ["unparseable-url"] };
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) reasons.push("ip-host");
  if (host.startsWith("xn--") || host.includes(".xn--")) reasons.push("punycode");
  if (SHORTENERS.has(host)) reasons.push("shortener");
  const tld = host.split(".").pop() ?? "";
  if (RISKY_TLDS.has(tld)) reasons.push(`risky-tld:${tld}`);
  for (const target of LOOKALIKE_TARGETS) {
    const squashed = host.replace(/[^a-z]/g, "");
    if (squashed.includes(target) && !host.endsWith(`${target}.co.ke`) && !host.endsWith(`${target}.com`)) {
      reasons.push(`lookalike:${target}`);
    }
  }
  const labels = host.split(".").filter((label, i) => !(i === 0 && label === "www"));
  if (labels.length > 3) reasons.push("deep-subdomain");
  return { host, suspicious: reasons.length > 0, reasons };
}

export function findUrls(text: string): string[] {
  return [...new Set(text.match(/\b(?:https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?/gi) ?? [])]
    .filter((u) => registrableHost(u) !== null && !/^\d+$/.test(u));
}
