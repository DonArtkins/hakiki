"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SAMPLES } from "@/lib/samples";
import { t } from "@/lib/i18n";
import { Logo } from "./ui";
import { useLocale } from "./LocaleProvider";

export function Landing() {
  const { locale } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const sample = SAMPLES[0];
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let disposed = false;
    (async () => {
      const gsap = (await import("gsap")).default;
      if (disposed) return;
      const q = gsap.utils.selector(rootRef.current);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        // guides: promise first, then sample, then entry
        tl.fromTo(q("[data-reveal='1']"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 })
          .fromTo(q("[data-reveal='2']"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.35")
          .fromTo(q("[data-reveal='3']"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
        return () => { tl.kill(); };
      });
      ctx = mm;
    })();
    return () => { disposed = true; ctx?.revert(); };
  }, []);
  return (
    <div ref={rootRef} className="landing">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow" data-reveal="1">{t(locale, "landing.kicker")}</p>
          <h1 className="display landing-title" data-reveal="1">{t(locale, "brand.tagline")}</h1>
          <p className="landing-lede" data-reveal="2">{t(locale, "landing.lede")}</p>
          <div data-reveal="3"><Link className="btn-primary landing-cta" href="/studio">{t(locale, "landing.open")}</Link></div>
          <ol className="how-list" data-reveal="3" aria-label={t(locale, "landing.howTitle")}>
            <li>{t(locale, "landing.how1")}</li><li>{t(locale, "landing.how2")}</li><li>{t(locale, "landing.how3")}</li>
          </ol>
        </div>
        <aside className="landing-sample card" data-reveal="2">
          <div className="sample-head"><Logo size={28} /><h2 className="eyebrow" style={{ margin: 0 }}>{t(locale, "landing.sampleTitle")}</h2></div>
          <p className="sample-text">{sample.text}</p>
          <p className="muted-small">{t(locale, "landing.sampleNote")}</p>
          <Link className="btn-secondary" href={`/studio?sample=${sample.id}`}>{t(locale, "landing.runSample")}</Link>
        </aside>
      </section>
    </div>
  );
}
