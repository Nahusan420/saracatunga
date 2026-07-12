/**
 * IMPORMOT - E-Commerce Core Types
 * Define the domain data model for users, products, orders, and search filters.
 */

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string; // Provincia
  zipCode: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string; // e.g. "Yamaha", "Honda"
  price: number;
  offerPrice?: number; // Precio promocional
  stock: number;
  category: string; // e.g. "Repuestos", "Frenos"
  description: string;
  images: string[];
  specs: Record<string, string>; // Dynamic Key-Value specifications
  tags: string[];
  
  // Advanced Compatibility Fields
  compatibleMotos: string[]; // List of compatible brand names (e.g. ["Honda", "Yamaha"])
  compatibleModels: string[]; // List of specific compatible models (e.g. ["Honda Wave 110", "Honda XR150"])
  compatibleDisplacements: string[]; // List of compatible engine sizes (e.g. ["110cc", "150cc"])
}

export type OrderStatus = 'Pendiente' | 'Confirmado' | 'Preparando pedido' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId?: string; // Empty if guest checkout
  isGuest: boolean;
  customerName: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string; // Provincia
  zipCode?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId?: string; // Optional (system-wide if undefined)
  title: string;
  content: string;
  type: 'order' | 'promo' | 'system';
  date: string;
  read: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterState {
  search: string;
  brand: string;
  displacement: string;
  motoModel: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  availability: 'all' | 'in_stock' | 'out_of_stock';
}

export interface MotoModel {
  id: string;
  name: string;
}
