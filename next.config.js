/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
  // Old gold-store pages now point to their silver equivalents.
  async redirects() {
    return [
      { source: "/gold-rate", destination: "/silver-rate", permanent: true },
      { source: "/gold", destination: "/shop", permanent: true },
      { source: "/diamond", destination: "/shop", permanent: true },
      { source: "/bridal", destination: "/jewellery/sets", permanent: true },
      { source: "/jewellery/pendants", destination: "/jewellery/necklaces", permanent: true },
      { source: "/jewellery/chains", destination: "/jewellery/necklaces", permanent: true },
      { source: "/jewellery/bangles", destination: "/jewellery/bracelets", permanent: true },
      { source: "/jewellery/:slug(nosepins|coins|cufflinks)", destination: "/shop", permanent: true },
    ];
  },
};
module.exports = nextConfig;
