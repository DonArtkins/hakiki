"use client";
import Link from "next/link";
import { useRef } from "react";
import { SAMPLES } from "@/lib/samples";
import { t } from "@/lib/i18n";
import { Logo } from "./ui";
import { useLocale } from "./LocaleProvider";
import { useRevealScope } from "@/lib/use-reveal";

export function Landing() {
  const { locale } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const sample = SAMPLES[0];
  const care = SAMPLES[1];
  const genuine = SAMPLES[2];
  useRevealScope(rootRef);
  const headline = t(locale, "brand.tagline");
  const words = headline.split(" ");
  return (
    <div ref={rootRef} className="landing">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">{t(locale, "landing.kicker")}</p>
          <h1 className="display landing-title" aria-label={headline}>
            {words.map((w, i) => (
              <span key={i} data-hero="word" className="hero-word" aria-hidden="true">{w}{i < words.length - 1 ? " " : ""}</span>
            ))}
          </h1>
          <p className="landing-lede" data-hero="lede">{t(locale, "landing.lede")}</p>
          <div data-hero="action"><Link className="btn-primary landing-cta" href="/studio">{t(locale, "landing.open")}</Link></div>
          <ol className="how-list" aria-label={t(locale, "landing.howTitle")}>
            <li>{t(locale, "landing.how1")}</li><li>{t(locale, "landing.how2")}</li><li>{t(locale, "landing.how3")}</li>
          </ol>
        </div>
        <aside className="landing-sample card" data-hero="artefact">
          <div className="sample-head"><Logo size={28} /><h2 className="eyebrow" style={{ margin: 0 }}>{t(locale, "landing.sampleTitle")}</h2></div>
          <p className="sample-text">Confirmed. Ksh 15,000 sent to you by mistake. <mark className="evidence">Please reverse it now</mark> within 30 minutes, <mark className="evidence">tuma kwa hii number 0712345678</mark>. Haraka!</p>
          <p className="muted-small">{t(locale, "landing.sampleNote")}</p>
          <Link className="btn-secondary" href={`/studio?sample=${sample.id}`}>{t(locale, "landing.runSample")}</Link>
        </aside>
      </section>
      <section className="landing-section" data-scroll-reveal>
        <h2 className="display section-title">{t(locale, "landing.checksTitle")}</h2>
        <div className="bento-checks">
          <article className="card bento-wide">
            <h3>{t(locale, "landing.checkReading")}</h3>
            <p>{t(locale, "landing.checkReadingBody")}</p>
          </article>
          <article className="card">
            <h3>{t(locale, "landing.checkKenya")}</h3>
            <p>{t(locale, "landing.checkKenyaBody")}</p>
          </article>
          <article className="card">
            <h3>{t(locale, "landing.checkThinking")}</h3>
            <p>{t(locale, "landing.checkThinkingBody")}</p>
          </article>
        </div>
      </section>
      <section className="landing-section" data-scroll-reveal>
        <h2 className="display section-title">{t(locale, "landing.proofTitle")}</h2>
        <p className="muted-lede">{t(locale, "landing.proofNote")}</p>
        <div className="bento-proof">
          <article className="card bento-wide">
            <p className="eyebrow">{locale === "sw" ? care.label_sw : care.label_en}</p>
            <p className="sample-text">{care.text}</p>
            <Link className="btn-secondary" href={`/studio?sample=${care.id}`}>{t(locale, "landing.runSample")}</Link>
          </article>
          <article className="card">
            <p className="eyebrow">{locale === "sw" ? genuine.label_sw : genuine.label_en}</p>
            <p className="sample-text">{genuine.text}</p>
            <Link className="btn-secondary" href={`/studio?sample=${genuine.id}`}>{t(locale, "landing.runSample")}</Link>
          </article>
        </div>
      </section>
    </div>
  );
}
