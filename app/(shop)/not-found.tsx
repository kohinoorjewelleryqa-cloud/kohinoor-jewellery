import Link from "next/link";
export default function NotFound() {
  return <main className="wrap"><div className="panel confirm" style={{ margin: "40px 0" }}><b className="big">Page not found</b><span style={{ color: "var(--muted)" }}>The piece or page you are looking for has moved or is no longer available.</span><Link className="btn p" href="/shop">Browse jewellery</Link></div></main>;
}
