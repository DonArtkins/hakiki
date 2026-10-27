export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const text = String(form?.get("text") ?? form?.get("url") ?? "").slice(0, 2000);
  const url = new URL("/", req.url);
  if (text) url.searchParams.set("shared_text", text);
  return Response.redirect(url, 303);
}
