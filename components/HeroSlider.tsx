"use client";
import { Children, useEffect, useState } from "react";

const SPARKS: [number, number, number, number][] = [[58, 22, 18, 0], [72, 58, 12, 1.2], [86, 30, 22, 2.1], [64, 78, 10, 3], [92, 70, 14, 0.7], [79, 12, 10, 2.6]];

export default function HeroSlider({ children }: { children: React.ReactNode }) {
  const slides = Children.toArray(children);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, i]);
  return (
    <div className="slides">
      {slides.map((s, j) => <div key={j} className="slide-wrap" hidden={j !== i}>{s}</div>)}
      {/* twinkling silver sparkles and a slow sheen across the banner (decoration only) */}
      <div className="sparkles" aria-hidden="true">{SPARKS.map(([x, y, s, d], k) => <i key={k} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }} />)}</div>
      <div className="dots" role="tablist" aria-label="Slides">
        {slides.map((_, j) => <button key={j} type="button" aria-label={`Slide ${j + 1}`} aria-current={j === i} onClick={() => setI(j)} />)}
      </div>
    </div>
  );
}
