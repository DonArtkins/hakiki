export function GET() {
  return Response.json({
    name: "Hakiki", short_name: "Hakiki", start_url: "/", display: "standalone",
    background_color: "#FAF8F4", theme_color: "#0F6B4F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
    share_target: {
      action: "/share", method: "POST", enctype: "multipart/form-data",
      params: { title: "title", text: "text", url: "url", files: [{ name: "media", accept: ["image/*"] }] },
    },
  }, { headers: { "content-type": "application/manifest+json" } });
}
