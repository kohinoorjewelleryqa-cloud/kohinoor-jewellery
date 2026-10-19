"use client";
import { useStore } from "./StoreProvider";

export const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
);

export default function WishButton({ id, className = "wl" }: { id: string; className?: string }) {
  const { wish, toggleWish } = useStore();
  const on = wish.includes(id);
  return (
    <button className={className} type="button" aria-pressed={on} aria-label={on ? "Remove from wishlist" : "Save to wishlist"} onClick={() => toggleWish(id)}>
      <HeartIcon />
    </button>
  );
}
