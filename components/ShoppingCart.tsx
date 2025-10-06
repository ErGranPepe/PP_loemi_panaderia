import React from 'react';
import { CartItem } from '../types';

interface ShoppingCartProps {
    items: CartItem[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ items, isOpen, onClose, onUpdateQuantity }) => {
    const totalPrice = items.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-2xl font-bold text-stone-800">Tu Pedido</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
                           <p className="text-stone-600">Tu carrito está vacío.</p>
                           <p className="text-sm text-stone-500 mt-2">Añade productos para verlos aquí.</p>
                        </div>
                    ) : (
                        <div className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center space-x-4">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover"/>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-stone-800">{item.name}</h3>
                                            <p className="text-amber-800 font-bold">{parseFloat(item.price).toFixed(2)}€</p>
                                        </div>
                                        <div className="flex items-center border border-stone-200 rounded-md">
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-lg font-bold hover:bg-stone-100">-</button>
                                            <span className="px-3 py-1">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-lg font-bold hover:bg-stone-100">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {items.length > 0 && (
                        <div className="p-4 border-t space-y-4">
                            <div className="flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>{totalPrice.toFixed(2)}€</span>
                            </div>
                            <button className="w-full py-3 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900">
                                Tramitar Pedido
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ShoppingCart;