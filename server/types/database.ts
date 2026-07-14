export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  offerPrice?: number;
  stock: number;
  category: string;
  description: string;
  images: string[];
  specs: Record<string, any>;
  tags: string[];
  compatibleMotos: string[];
  compatibleModels: string[];
  compatibleDisplacements: string[];
}
