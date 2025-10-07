import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div 
            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg cursor-pointer border border-stone-200"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1200px' }}
        >
            <div 
                className={`relative w-full h-full transition-transform duration-500 ease-in-out transform-style-3d flex-grow flex flex-col ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ willChange: 'transform' }}
            >
                {/* Cara Frontal */}
                <div className={`absolute inset-0 backface-hidden flex flex-col rounded-lg sm:rounded-xl overflow-hidden transition-opacity duration-300 ${isFlipped ? 'opacity-0' : 'opacity-100'}`} >
                    {product.promotionType === '2x1' && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">2x1</div>
                    )}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-36 sm:h-48 object-cover"
                    />
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm sm:text-lg font-serif font-semibold text-stone-900">{product.name}</h4>
                            <span className="text-sm sm:text-base font-bold text-amber-900">{parseFloat(product.price).toFixed(2)}€</span>
                        </div>
                        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed flex-grow font-serif line-clamp-3">
                            {product.description}
                        </p>
                    </div>
                </div>

                {/* Cara Trasera */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col justify-between overflow-y-auto transition-opacity duration-300 delay-200 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                        <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-2">{product.name}</h3>
                        {product.ingredients && (
                            <div className="mb-3">
                                <p className="font-semibold text-stone-800 text-sm">Ingredientes:</p>
                                <p className="text-xs text-stone-600">{product.ingredients}</p>
                            </div>
                        )}
                        {product.allergens && (
                            <div className="mb-3">
                                <p className="font-semibold text-stone-800 text-sm">Alérgenos:</p>
                                <p className="text-xs text-red-600 font-bold">{product.allergens}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-auto pt-1 sm:pt-2 border-t border-stone-200 text-center text-stone-500 text-[10px] sm:text-xs">
                        Haz clic para volver
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;