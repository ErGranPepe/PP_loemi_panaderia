// types.ts

export type ProductCategory = 'Panes' | 'Bollería' | 'Pasteles y Tartas' | 'Salados';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string; // For sales/offers
  image: string;
  category: ProductCategory;
  allergens?: string;
  ingredients?: string;
  productionTimeDays?: number;
  stock?: number;
  cost?: number;
  isFeatured?: boolean;
  isSeasonal?: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface ChatOrder {
  items: { product: string; quantity: number; price: number }[];
  customerInfo: { name?: string; phone?: string; email?: string };
  total: number;
  notes?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  customer: Customer;
  date: string; // ISO string
  status: 'Pendiente' | 'En preparación' | 'Entregado' | 'Cancelado';
  total: number;
  items: OrderItem[];
  source: 'web' | 'whatsapp' | 'chat';
}

export interface SectionConfig {
  id: string;
  name: string;
  title: string;
  enabled: boolean;
  editableTitle: boolean;
  content: string;
  bgClass: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface Consultation {
  id: number;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read: boolean;
}
