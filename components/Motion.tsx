"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Things that rise into view as you scroll, one after another within each group. */
const REVEAL = [
  ".sh", ".occ > a", ".rail > *", ".grid > *", ".cols > *", ".metals > a", ".looks > a", ".recip > a",
  ".seo .wrap > div > *", ".catgrid > a", ".marquee", ".fgrid > *",
].join(",");

/**
 * Site animations: scroll reveals, 3D tilt with a silver glare on product photos and category circles,
 * and a soft light that follows the pointer across the hero. Off for visitors who prefer reduced motion.
 */
export default function Motion() {
  const path = usePathname();
  const qs = useSearchParams()?.toString();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { root.classList.remove("motion"); return; }
    root.classList.add("motion");
    const cleanups: (() => void)[] = [];

    // 1) Reveal on scroll. Only things below the first screen are hidden first, so nothing visible blinks.
    const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL)).filter(
      (el) => !el.closest("header,.drawer,.adm") && el.dataset.r === undefined && el.getBoundingClientRect().top > window.innerHeight * 0.9,
    );
    els.forEach((el) => {
      const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => (c as HTMLElement).matches(REVEAL)) : [el];
      el.dataset.r = "";
      el.style.setProperty("--d", `${Math.min(Math.max(0, sibs.indexOf(el)), 8) * 70}ms`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        // Side-scrolling rows reveal together (cards off to the side never "enter" the screen).
        const parent = e.target.parentElement;
        const group = parent && parent.matches(".rail,.cols.scroll,.looks") ? Array.from(parent.children) : [e.target];
        group.forEach((el) => { el.classList.add("in"); io.unobserve(el); });
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      // 2) Product photos and category circles tilt towards the pointer with a silver glare.
      const sel = ".card .im,.occ .c,.coll .im";
      const onMove = (ev: PointerEvent) => {
        const el = (ev.target as HTMLElement).closest?.<HTMLElement>(sel);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
        el.style.setProperty("--gx", `${x * 100}%`);
        el.style.setProperty("--gy", `${y * 100}%`);
        el.classList.add("tilt");
      };
      const onOut = (ev: PointerEvent) => {
        const el = (ev.target as HTMLElement).closest?.<HTMLElement>(sel);
        if (el && !el.contains(ev.relatedTarget as Node)) { el.classList.remove("tilt"); el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); }
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerout", onOut);
      cleanups.push(() => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerout", onOut); });

      // 3) A soft silver light follows the pointer across the hero.
      const hero = document.querySelector<HTMLElement>(".slides");
      if (hero) {
        let raf = 0;
        const move = (ev: PointerEvent) => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            const r = hero.getBoundingClientRect();
            hero.style.setProperty("--mx", `${ev.clientX - r.left}px`);
            hero.style.setProperty("--my", `${ev.clientY - r.top}px`);
            hero.classList.add("lit");
          });
        };
        const leave = () => hero.classList.remove("lit");
        hero.addEventListener("pointermove", move);
        hero.addEventListener("pointerleave", leave);
        cleanups.push(() => { hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", leave); });
      }
    }

    // 4) Header gets a soft shadow once the page scrolls.
    const head = document.querySelector<HTMLElement>("header.site");
    const onScroll = () => head?.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    return () => cleanups.forEach((f) => f());
  }, [path, qs]);

  return null;
}
