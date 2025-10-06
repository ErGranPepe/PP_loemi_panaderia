import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Product) => void;
}

const categories: ProductCategory[] = ['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados'];

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'category'> & { id?: number; category: ProductCategory }>({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Panes',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (product) {
            setFormData(product);
            setImagePreview(product.image);
        } else {
            setFormData({ name: '', description: '', price: '', image: '', category: 'Panes' });
            setImagePreview('');
        }
        setImageFile(null);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
                setFormData(prev => ({ ...prev, image: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: product?.id || Date.now(), // Use existing id or generate new one
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto modal-mobile">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full hover:bg-stone-100 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-800">{product ? 'Editar Producto' : 'Añadir Producto'}</h2>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-stone-700">Nombre</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-base" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-stone-700">Descripción</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-base"></textarea>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-stone-700">Precio (ej: 3.50)</label>
                        <input type="text" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-base" />
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-stone-700">Imagen del Producto</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" 
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img src={imagePreview} alt="Vista previa" className="w-32 h-32 object-cover rounded-md" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-stone-700">Categoría</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                           {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-200 text-stone-800 font-semibold rounded-lg hover:bg-stone-300 touch-target">Cancelar</button>
                         <button type="submit" className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900 touch-target">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;