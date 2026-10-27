import { runCheck } from "../src/engine";

// CLI channel for the one engine (docs/03 section 9): pnpm check "message text"
async function main() {
  const text = process.argv.slice(2).join(" ").trim();
  if (!text) {
    console.error('Usage: pnpm check "message text"');
    process.exit(2);
  }
  for await (const event of runCheck({ text, channel: "cli" }, { traceId: `cli-${Date.now()}` })) {
    console.log(JSON.stringify(event));
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : "check failed");
  process.exit(1);
});
