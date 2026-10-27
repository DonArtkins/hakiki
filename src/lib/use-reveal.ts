"use client";
import { useEffect, useRef, type RefObject } from "react";

// Reusable GSAP reveal with full cleanup. Content stays visible when GSAP
// fails to load: elements are only hidden by GSAP itself, never by CSS.
export function useRevealScope(rootRef: RefObject<HTMLElement | null>) {
  const mmRef = useRef<{ revert: () => void } | null>(null);
  useEffect(() => {
    let disposed = false;
    let mm: ReturnType<typeof import("gsap").default.matchMedia> | null = null;
    (async () => {
      try {
        const gsapMod = await import("gsap");
        const gsap = gsapMod.default;
        const st = await import("gsap/ScrollTrigger");
        if (disposed || !rootRef.current) return;
        gsap.registerPlugin(st.ScrollTrigger);
        mm = gsap.matchMedia();
        mmRef.current = mm as unknown as { revert: () => void };
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const q = gsap.utils.selector(rootRef.current);
          const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
          hero
            .fromTo(q("[data-hero='word']"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.52, stagger: 0.07 })
            .fromTo(q("[data-hero='lede']"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
            .fromTo(q("[data-hero='artefact']"), { opacity: 0, y: 20, rotate: 0 }, { opacity: 1, y: 0, rotate: -0.4, duration: 0.6 }, "-=0.2")
            .fromTo(q("[data-hero='action']"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 }, "-=0.3");
          const sections = q("[data-scroll-reveal]");
          sections.forEach((el) => {
            gsap.fromTo(el, { opacity: 0, y: 18 }, {
              opacity: 1, y: 0, duration: 0.55, ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          });
          return () => {
            hero.kill();
            st.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
          };
        });
      } catch {
        // GSAP unavailable: leave content visible.
      }
    })();
    return () => {
      disposed = true;
      mm?.revert();
      mmRef.current?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
