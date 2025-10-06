import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';

interface ProductsProps {
    products: Product[];
    isEditMode: boolean;
    onAdd: () => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: number) => void;
}

const categories = ['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados'];

const Products: React.FC<ProductsProps> = ({ products, isEditMode, onAdd, onEdit, onDelete }) => {
    const [clickedButtons, setClickedButtons] = useState<Set<number>>(new Set());
    const [flyingElements, setFlyingElements] = useState<Array<{id: string, product: Product, startRect: DOMRect}>>([]);
    const productRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = products.filter(product => product.category === category);
        return acc;
    }, {} as Record<string, Product[]>);



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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                {productsByCategory[category].map((product) => (
                                    <div key={product.id} className="group relative border border-stone-300 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white hover:scale-105">
                                        <div className="aspect-square bg-stone-100 overflow-hidden">
                                           <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <div className="p-4 sm:p-6 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg sm:text-xl font-serif font-semibold text-stone-900 leading-tight">{product.name}</h3>
                                                <p className="text-xl font-bold text-amber-900 ml-2">{parseFloat(product.price).toFixed(2)}€</p>
                                            </div>
                                            <p className="text-stone-600 text-sm leading-relaxed flex-grow font-serif">{product.description}</p>
                                            <div className="mt-4">
                                                {isEditMode && (
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => onEdit(product)} className="flex-1 px-4 py-2 text-sm bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600">Editar</button>
                                                        <button onClick={() => onDelete(product.id)} className="flex-1 px-4 py-2 text-sm bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-600">Eliminar</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}


            </div>
        </section>
    );
};

export default Products;
