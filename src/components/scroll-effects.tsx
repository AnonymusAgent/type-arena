"use client";

import { useEffect, useRef } from "react";

/** One observer and one passive scroll listener for the entire landing page. */
export default function ScrollEffects() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" },
    );

    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 55}ms`);
      if (item.getBoundingClientRect().top < window.innerHeight - 40) {
        item.classList.add("is-visible");
      } else {
        observer.observe(item);
      }
    });
    document.documentElement.classList.add("scroll-effects-ready");

    const hero = document.querySelector<HTMLElement>(".landing-hero");
    let frame = 0;
    const update = () => {
      frame = 0;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, window.scrollY / maxScroll)})`;
      if (hero) hero.style.setProperty("--hero-scroll", `${Math.min(550, window.scrollY) * 0.14}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.documentElement.classList.remove("scroll-effects-ready");
    };
  }, []);

  return <div ref={progressRef} className="scroll-progress" aria-hidden="true" />;
}
