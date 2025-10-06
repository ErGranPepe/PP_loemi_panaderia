// FIX: Removed self-import of 'Product' to resolve conflict with local declaration.

export type ProductCategory = 'Panes' | 'Bollería' | 'Pasteles y Tartas' | 'Salados';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: ProductCategory;
}

export interface CartItem extends Product {
    quantity: number;
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
  date: string;
  status: 'Pendiente' | 'En preparación' | 'Entregado' | 'Cancelado';
  total: number;
  items: OrderItem[];
  source: 'web' | 'whatsapp' | 'chat';
}

export interface ChatOrder {
  items: { product: string; quantity: number; price: number }[];
  customerInfo: { name?: string; phone?: string; email?: string };
  total: number;
  notes?: string;
}