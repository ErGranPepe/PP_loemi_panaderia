import React from 'react';
import { ContentBlock, Product } from '../types';
import ProductCard from './ProductCard';

interface CustomSectionProps {
  title: string;
  content: ContentBlock[];
  products: Product[];
}

const CustomSection: React.FC<CustomSectionProps> = ({ title, content, products }) => {
  // Si el contenido no es un array, intenta parsearlo o ignóralo
  const blocks: ContentBlock[] = Array.isArray(content)
    ? content
    : (() => {
        try {
          // content puede ser un string JSON de una versión anterior
          const parsed = JSON.parse(content as any);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // Si no es un JSON válido o no es un array, no renderizar nada
          return [];
        }
      })();

  if (blocks.length === 0) return null;

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return <div className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: block.value }} />;
      case 'product':
        const product = products.find(p => p.id === parseInt(block.value, 10));
        return product ? (
          <div className="not-prose my-4 flex justify-center">
            <div className="w-full sm:w-1/2 lg:w-1/3">
              <ProductCard product={product} />
            </div>
          </div>
        ) : <p className="text-red-500">Producto no encontrado.</p>;
      case 'image':
        return <img src={block.value} alt="Contenido de sección" className="w-full h-auto rounded-lg my-4 shadow-md" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h2 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl text-center mb-12">{title}</h2>
      <div className="space-y-8">
        {blocks.map(block => (
          <div key={block.id}>
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSection;