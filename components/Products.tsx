import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';

interface ProductsProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    isEditMode: boolean;
    onAdd: () => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: number) => void;
}

const categories = ['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados'];

const Products: React.FC<ProductsProps> = ({ products, onAddToCart, isEditMode, onAdd, onEdit, onDelete }) => {
    const [clickedButtons, setClickedButtons] = useState<Set<number>>(new Set());
    const [flyingElements, setFlyingElements] = useState<Array<{id: string, product: Product, startRect: DOMRect}>>([]);
    const productRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = products.filter(product => product.category === category);
        return acc;
    }, {} as Record<string, Product[]>);

    const handleAddToCart = (product: Product) => {
        const buttonElement = productRefs.current.get(product.id);
        if (buttonElement) {
            const rect = buttonElement.getBoundingClientRect();
            const flyingId = `${product.id}-${Date.now()}`;
            setFlyingElements(prev => [...prev, { id: flyingId, product, startRect: rect }]);

            // Remove flying element after animation
            setTimeout(() => {
                setFlyingElements(prev => prev.filter(el => el.id !== flyingId));
            }, 800);
        }

        setClickedButtons(prev => new Set(prev).add(product.id));
        onAddToCart(product);
        setTimeout(() => {
            setClickedButtons(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.id);
                return newSet;
            });
        }, 1000);
    };

    return (
        <section id="productos" className="py-16 sm:py-24 bg-stone-50">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold tracking-wide text-stone-900 sm:text-5xl">Nuestros Tesoros Horneados</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-700 font-serif italic">
                        Desde el pan de cada día hasta el capricho más dulce.
                    </p>
                    {isEditMode && (
                        <div className="mt-6">
                            <button onClick={onAdd} className="px-6 py-2 bg-amber-900 text-white font-semibold rounded-lg shadow-md hover:bg-amber-800">
                                Añadir Nuevo Producto
                            </button>
                        </div>
                    )}
                </div>
                {categories.map(category => (
                    productsByCategory[category].length > 0 && (
                        <div key={category} className="mb-16">
                            <h3 className="text-3xl font-serif font-bold text-stone-800 mb-8 text-center">{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {productsByCategory[category].map((product) => (
                                    <div key={product.id} className="group relative border border-stone-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col bg-white">
                                        <div className="aspect-w-4 aspect-h-3 bg-stone-100">
                                           <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-serif font-semibold text-stone-900">{product.name}</h3>
                                                <p className="text-lg font-bold text-amber-900">{parseFloat(product.price).toFixed(2)}€</p>
                                            </div>
                                            <p className="mt-2 text-stone-700 text-sm flex-grow font-serif italic">{product.description}</p>
                                            <div className="mt-4">
                                                {isEditMode ? (
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => onEdit(product)} className="flex-1 px-4 py-2 text-sm bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600">Editar</button>
                                                        <button onClick={() => onDelete(product.id)} className="flex-1 px-4 py-2 text-sm bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-600">Eliminar</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        ref={el => el && productRefs.current.set(product.id, el)}
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={clickedButtons.has(product.id)}
                                                        className={`w-full px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 transform ${
                                                            clickedButtons.has(product.id)
                                                                ? 'bg-green-700 text-white scale-95'
                                                                : 'bg-amber-900 text-white hover:bg-amber-800 hover:scale-105 active:scale-95'
                                                        }`}
                                                    >
                                                        {clickedButtons.has(product.id) ? '¡Añadido!' : 'Añadir al carrito'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}

                {/* Flying Elements */}
                {flyingElements.map(({ id, product, startRect }) => {
                    const cartIcon = document.querySelector('[data-cart-icon]');
                    const cartRect = cartIcon ? cartIcon.getBoundingClientRect() : null;

                    if (!cartRect) return null;

                    const deltaX = cartRect.left + cartRect.width / 2 - (startRect.left + startRect.width / 2);
                    const deltaY = cartRect.top + cartRect.height / 2 - (startRect.top + startRect.height / 2);

                    return (
                        <div
                            key={id}
                            className="fixed pointer-events-none z-50 animate-fly-to-cart"
                            style={{
                                left: startRect.left + startRect.width / 2 - 20,
                                top: startRect.top + startRect.height / 2 - 20,
                                '--cart-x': `${deltaX}px`,
                                '--cart-y': `${deltaY}px`,
                            } as React.CSSProperties}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-amber-900"
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Products;
