"use client";
import { Children, useEffect, useState } from "react";

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
      <div className="dots" role="tablist" aria-label="Slides">
        {slides.map((_, j) => <button key={j} type="button" aria-label={`Slide ${j + 1}`} aria-current={j === i} onClick={() => setI(j)} />)}
      </div>
    </div>
  );
}
