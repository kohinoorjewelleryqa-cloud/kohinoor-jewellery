// Re-mounts on every page change, so each new page fades in gently.
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
