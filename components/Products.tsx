import React, { useState, useMemo } from "react";
import { Product } from '../types';

interface ProductsProps {
  products: Product[],
  title?: string;
  categories: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg cursor-pointer border border-stone-200"
      style={{
        perspective: "1200px",
        minHeight: "240px",
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-36 sm:h-48 object-cover"
      />
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm sm:text-lg font-serif font-semibold text-stone-900">
            {product.name}
          </h4>
          <span className="text-sm sm:text-base font-bold text-amber-900">
            {parseFloat(product.price).toFixed(2)}€
          </span>
        </div>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed flex-grow font-serif line-clamp-3">
          {product.description}
        </p>
      </div>
    </div>
  );
};

const Products: React.FC<ProductsProps> = ({ products, title, categories }) => {
    // ✅ Aseguramos que se reagrupe cuando cambie el estado de productos
    const productsByCategory = useMemo(() => {
      return categories.reduce((acc, category) => {
        acc[category] = products.filter(p => p.category === category);
        return acc;
      }, {} as Record<string, Product[]>);
    }, [products, categories]);

    if (!products || products.length === 0) {
      return (
        <section className="w-full text-center py-12 text-stone-500 italic bg-[#fefbf7]">
          No hay productos registrados todavía.
        </section>
      );
    }

    return (
      <section
        id="productos"
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 bg-[#fefbf7] overflow-visible z-[5]"
      >
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-wide text-stone-900">
            {title || "Nuestros Productos"}
          </h2>
          <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-stone-700 font-serif italic">
            Desde el pan de cada día hasta el capricho más dulce.
          </p>
        </div>
    
        {/* 🔥 Mapeo de categorías */}
        <div className="space-y-12 sm:space-y-20">
          {categories.map((category) => {
            const items = productsByCategory[category] || [];
            if (items.length === 0) return null;
    
            return (
              <div key={category} className="relative z-[10]">
                <h3 className="text-lg sm:text-2xl font-serif font-semibold text-stone-800 mb-6 text-center">
                  {category}
                </h3>
    
                {/* 🔥 Grid responsivo con altura automática */}
                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    lg:grid-cols-4
                    gap-4 sm:gap-6 lg:gap-8
                    place-items-stretch
                    relative
                  "
                >
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
};

export default Products;
