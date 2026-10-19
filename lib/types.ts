export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  style: string | null;
  metal: string;
  stone: string;
  carat: number;
  weight_g: number;
  making_pct: number;
  making_discount_pct: number;
  stone_value: number;
  stock: number;
  occasions: string[];
  gender: string;
  collection: string | null;
  is_new: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  description: string | null;
  images: string[];
  art_variant: number;
  created_at?: string;
};

export type PricedProduct = Product & {
  metalValue: number;
  makingValue: number;
  discountValue: number;
  price: number;
  was: number;
};

export type Category = { slug: string; name: string; intro: string | null; sizes: string[]; sort_order?: number };
export type Collection = { slug: string; name: string; description: string | null; sort_order?: number };

export type Settings = {
  store_name: string;
  phone: string;
  whatsapp: string; // digits only, with country code, e.g. 97455555555
  email: string;
  address: string;
  hours: string;
  rates: Record<string, number>;
  rates_updated_at: string | null;
};

export type Catalog = {
  products: PricedProduct[];
  categories: Category[];
  collections: Collection[];
  settings: Settings;
  demo: boolean;
};

export type CartLine = { id: string; size: string | null; qty: number };

export type OrderItem = { id: string; sku: string; name: string; metal: string; weight_g: number; size: string | null; qty: number; unit_price: number; rate: number };
