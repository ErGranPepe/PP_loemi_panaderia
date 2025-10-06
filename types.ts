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