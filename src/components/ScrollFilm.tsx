"use client";
import { useEffect, useRef } from "react";
import { t, type Locale } from "@/lib/i18n";

// Frame-by-frame scroll film: real screenshots of one live check, scrubbed by
// scroll (explains: the pipeline stages happen in this order). Reduced motion
// gets the final frame and the chapter list without pinning.
const FRAMES = 13;
const CHAPTERS = ["stage.extracting", "stage.rules", "stage.reasoning", "verdict.high"] as const;

export function ScrollFilm({ locale }: { locale: Locale }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let disposed = false;
    let mm: { revert: () => void } | null = null;
    (async () => {
      const images: HTMLImageElement[] = [];
      let loaded = 0;
      const draw = (idx: number) => {
        const canvas = canvasRef.current; const img = images[idx];
        if (!canvas || !img?.complete || img.naturalWidth === 0) return;
        const ctx = canvas.getContext("2d"); if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      for (let i = 1; i <= FRAMES; i++) { const img = new Image(); img.src = `/film/f${String(i).padStart(2, "0")}.jpg`; img.onload = () => { loaded++; if (loaded === 1) draw(0); if (i === FRAMES) draw(FRAMES - 1); }; images.push(img); }
      try {
        const gsap = (await import("gsap")).default;
        const st = await import("gsap/ScrollTrigger");
        if (disposed || !rootRef.current) return;
        gsap.registerPlugin(st.ScrollTrigger);
        mm = gsap.matchMedia() as unknown as { revert: () => void };
        (mm as unknown as { add: (q: string, fn: () => void) => void }).add("(prefers-reduced-motion: no-preference)", () => {
          const state = { frame: 0 };
          gsap.to(state, {
            frame: FRAMES - 1, ease: "none",
            scrollTrigger: { trigger: rootRef.current, start: "top 64%", end: "+=1400", scrub: 0.4, pin: true, anticipatePin: 1 },
            onUpdate: () => {
              const idx = Math.round(state.frame);
              draw(idx);
              const chapter = CHAPTERS[Math.min(CHAPTERS.length - 1, Math.floor((idx / (FRAMES - 1)) * CHAPTERS.length))];
              if (chapterRef.current) chapterRef.current.textContent = t(locale, chapter);
            },
          });
        });
        (mm as unknown as { add: (q: string, fn: () => void) => void }).add("(prefers-reduced-motion: reduce)", () => { draw(FRAMES - 1); });
      } catch { draw(FRAMES - 1); }
    })();
    return () => { disposed = true; mm?.revert(); };
  }, [locale]);

  return (
    <section ref={rootRef} className="landing-section film-section" aria-label={t(locale, "film.title")}>
      <h2 className="display section-title">{t(locale, "film.title")}</h2>
      <div className="film-grid">
        <canvas ref={canvasRef} className="film-canvas" width={1100} height={619} role="img" aria-label={t(locale, "film.title")} />
        <div>
          <p ref={chapterRef} className="film-chapter" role="status">{t(locale, CHAPTERS[0])}</p>
          <ol className="film-chapters">
            {CHAPTERS.map((c) => <li key={c}>{t(locale, c)}</li>)}
          </ol>
          <p className="muted-small">{t(locale, "film.note")}</p>
        </div>
      </div>
    </section>
  );
}
