import Link from "next/link";
export default function SimplePage({ title, crumb, children }: { title: string; crumb: string; children: React.ReactNode }) {
  return (
    <main className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{crumb}</span></nav>
      <div className="pagehead"><h1>{title}</h1></div>
      {children}
    </main>
  );
}
