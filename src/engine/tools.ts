import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { checkUrlShape } from "./rules/url";
import { isTaxonomyId } from "./taxonomy";
import type { EvidencePack } from "./schemas";

// Tools are read-only (architecture rule 5): local playbook files, in-memory community counts
// supplied by the caller, and pure URL shape analysis. No network, no writes, ever.
export const TOOL_DEFINITIONS = [
  { type: "function", name: "lookup_playbook", description: "Get official next steps and numbers for a scam type", parameters: { type: "object", properties: { scam_type: { type: "string" } }, required: ["scam_type"], additionalProperties: false } },
  { type: "function", name: "community_lookup", description: "Counts of community reports for the indicators in this check", parameters: { type: "object", properties: { kinds: { type: "array", items: { type: "string" } } }, required: ["kinds"], additionalProperties: false } },
  { type: "function", name: "check_url_shape", description: "Static analysis of a URL shape (no network)", parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"], additionalProperties: false } },
] as const;

export interface Playbook {
  id: string;
  name_en: string;
  name_sw: string;
  steps_en: string[];
  steps_sw: string[];
  contacts: string[];
}

const cache = new Map<string, Playbook>();

export async function lookupPlaybook(scamType: string): Promise<Playbook | null> {
  if (!isTaxonomyId(scamType)) return null;
  const hit = cache.get(scamType);
  if (hit) return hit;
  try {
    const raw = await readFile(join(process.cwd(), "data", "playbook", `${scamType}.json`), "utf8");
    const parsed = JSON.parse(raw) as Playbook;
    cache.set(scamType, parsed);
    return parsed;
  } catch {
    return null;
  }
}

const PlaybookArgs = z.object({ scam_type: z.string() });
const CommunityArgs = z.object({ kinds: z.array(z.string()).max(5) });
const UrlArgs = z.object({ url: z.string().max(500) });

export async function runTool(name: string, argsJson: string, pack: EvidencePack): Promise<unknown> {
  let args: unknown;
  try {
    args = JSON.parse(argsJson);
  } catch {
    return { error: "bad_arguments" };
  }
  switch (name) {
    case "lookup_playbook": {
      const a = PlaybookArgs.safeParse(args);
      if (!a.success) return { error: "bad_arguments" };
      return (await lookupPlaybook(a.data.scam_type)) ?? { error: "unknown_scam_type" };
    }
    case "community_lookup": {
      const a = CommunityArgs.safeParse(args);
      if (!a.success) return { error: "bad_arguments" };
      return pack.community.filter((c) => a.data.kinds.includes(c.kind));
    }
    case "check_url_shape": {
      const a = UrlArgs.safeParse(args);
      if (!a.success) return { error: "bad_arguments" };
      return checkUrlShape(a.data.url);
    }
    default:
      return { error: "unknown_tool" };
  }
}
