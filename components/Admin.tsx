import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';

interface AdminProps {
    onBack: () => void;
}

const categories: ProductCategory[] = ['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados'];
const ADMIN_PASSWORD = 'admin'; // Simple password for demo

const Admin: React.FC<AdminProps> = ({ onBack }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Panes' as ProductCategory,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        const storedProducts = localStorage.getItem('loemi-products');
        if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
        }
    }, []);

    const saveProducts = (newProducts: Product[]) => {
        setProducts(newProducts);
        localStorage.setItem('loemi-products', JSON.stringify(newProducts));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            id: editingProduct ? editingProduct.id : Date.now(),
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image: formData.image,
            category: formData.category,
        };

        let newProducts;
        if (editingProduct) {
            newProducts = products.map(p => p.id === editingProduct.id ? product : p);
        } else {
            newProducts = [...products, product];
        }

        saveProducts(newProducts);
        setFormData({ name: '', description: '', price: '', image: '', category: 'Panes' });
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview('');
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category,
        });
        setImagePreview(product.image);
        setImageFile(null);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
            const newProducts = products.filter(p => p.id !== id);
            saveProducts(newProducts);
        }
    };

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('Contraseña incorrecta');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold text-stone-800 text-center mb-6">Acceso Administrativo</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Ingresa la contraseña"
                            />
                        </div>
                        {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
                        <button type="submit" className="w-full px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900">
                            Entrar
                        </button>
                    </form>
                    <button onClick={onBack} className="mt-4 w-full px-4 py-2 bg-stone-500 text-white font-semibold rounded-lg hover:bg-stone-600">
                        Volver a la Web
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800">Panel de Administración - Loemi Artesanos</h1>
                    <button onClick={onBack} className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700">
                        Volver a la Web
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulario */} 
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Precio (€)</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    placeholder="3.50"
                                    className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Imagen del Producto</label>
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
                                <label className="block text-sm font-medium text-stone-700">Categoría</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-stone-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="flex space-x-2">
                                <button type="submit" className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900">
                                    {editingProduct ? 'Actualizar' : 'Añadir'} Producto
                                </button>
                                {editingProduct && (
                                    <button type="button" onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', image: '', category: 'Panes' }); setImageFile(null); setImagePreview(''); }} className="px-4 py-2 bg-stone-500 text-white font-semibold rounded-lg hover:bg-stone-600">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Lista de Productos */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Productos Actuales ({products.length})</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {products.map(product => (
                                <div key={product.id} className="border border-stone-200 rounded-lg p-4 flex items-center space-x-4">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-stone-800">{product.name}</h3>
                                        <p className="text-stone-600 text-sm">{product.description.substring(0, 50)}...</p>
                                        <p className="text-amber-800 font-bold">{product.price}€</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEdit(product)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
