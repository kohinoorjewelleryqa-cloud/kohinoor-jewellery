import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavProgress from "@/components/NavProgress";
import Motion from "@/components/Motion";
import { Suspense } from "react";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { StoreProvider } from "@/components/StoreProvider";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 600;

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { settings, categories, collections, demo } = await getCatalog();
  return (
    <StoreProvider>
      <NavProgress />
      <Suspense fallback={null}><Motion /></Suspense>
      {demo && <div className="demo-bar">Demo mode: showing 2,000 sample products. Connect Supabase to use real data.</div>}
      <Header rates={settings.rates} categories={categories} />
      {children}
      <Footer settings={settings} categories={categories} collections={collections} />
      <WhatsAppFloat number={settings.whatsapp} />
    </StoreProvider>
  );
}
