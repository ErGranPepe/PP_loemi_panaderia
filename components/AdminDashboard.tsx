import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, Order } from '../types';
import { OrderManager } from '../utils/orderManager';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados']);
  const [newCategory, setNewCategory] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderManager] = useState(() => OrderManager.getInstance());
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Panes' as ProductCategory
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [] as { productId?: number; quantity: number; customPrice?: number; customName?: string; isCustom?: boolean }[]
  });
  const [productFilter, setProductFilter] = useState({
    search: '',
    category: 'Todas',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: '', price: '' });

  useEffect(() => {
    const storedProducts = localStorage.getItem('loemi-products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
    setOrders(orderManager.getOrders());
  }, [orderManager]);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('loemi-products', JSON.stringify(newProducts));
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const deleteCategory = (category: string) => {
    if (window.confirm(`¿Eliminar categoría "${category}"?`)) {
      setCategories(categories.filter(c => c !== category));
    }
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Panes'
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowProductModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setProductForm(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.price) return;
    
    const productData = {
      ...productForm,
      id: editingProduct?.id || Date.now(),
      image: productForm.image || imagePreview || 'https://via.placeholder.com/400x400?text=Producto'
    };

    let newProducts;
    if (editingProduct) {
      newProducts = products.map(p => p.id === editingProduct.id ? productData : p);
    } else {
      newProducts = [...products, productData];
    }
    
    saveProducts(newProducts);
    setShowProductModal(false);
    setImageFile(null);
    setImagePreview('');
  };

  const deleteProduct = (productId: number) => {
    if (window.confirm('¿Eliminar producto?')) {
      const newProducts = products.filter(p => p.id !== productId);
      saveProducts(newProducts);
    }
  };

  const createOrder = () => {
    if (!orderForm.customerName || !orderForm.customerPhone || orderForm.items.length === 0) {
      alert('Completa todos los campos');
      return;
    }

    const orderItems = orderForm.items.map(item => {
      if (item.isCustom) {
        return {
          name: item.customName || 'Producto personalizado',
          quantity: item.quantity,
          price: item.customPrice || 0
        };
      } else {
        const product = products.find(p => p.id === item.productId);
        return {
          name: product?.name || '',
          quantity: item.quantity,
          price: item.customPrice !== undefined ? item.customPrice : parseFloat(product?.price || '0')
        };
      }
    });

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order: Order = {
      id: `ORD-${Date.now()}`,
      customer: {
        name: orderForm.customerName,
        phone: orderForm.customerPhone,
        email: orderForm.customerEmail
      },
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      total,
      items: orderItems,
      source: 'web'
    };

    orderManager.addOrder(order);
    setOrders(orderManager.getOrders());
    setShowOrderModal(false);
    setOrderForm({ customerName: '', customerPhone: '', customerEmail: '', items: [] });
    setCustomProduct({ name: '', price: '' });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    orderManager.updateOrderStatus(orderId, status);
    setOrders(orderManager.getOrders());
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    
    if (productFilter.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(productFilter.search.toLowerCase()) ||
        p.description.toLowerCase().includes(productFilter.search.toLowerCase())
      );
    }
    
    if (productFilter.category !== 'Todas') {
      filtered = filtered.filter(p => p.category === productFilter.category);
    }
    
    filtered.sort((a, b) => {
      let aVal = a[productFilter.sortBy as keyof Product];
      let bVal = b[productFilter.sortBy as keyof Product];
      
      if (productFilter.sortBy === 'price') {
        aVal = parseFloat(a.price);
        bVal = parseFloat(b.price);
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return productFilter.sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return productFilter.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
    
    return filtered;
  };

  const renderCategories = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Categorías</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Añadir Nueva Categoría</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nombre de la categoría"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button 
            onClick={addCategory}
            className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
          >
            Añadir
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Categorías Actuales</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{category}</span>
                <button
                  onClick={() => deleteCategory(category)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    const filteredProducts = getFilteredProducts();
    
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestión de Productos</h2>
          <button
            onClick={() => openProductModal()}
            className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
          >
            Añadir Producto
          </button>
        </div>
        
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={productFilter.search}
              onChange={(e) => setProductFilter({...productFilter, search: e.target.value})}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={productFilter.category}
              onChange={(e) => setProductFilter({...productFilter, category: e.target.value})}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Todas">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={productFilter.sortBy}
              onChange={(e) => setProductFilter({...productFilter, sortBy: e.target.value})}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="category">Ordenar por categoría</option>
            </select>
            <select
              value={productFilter.sortOrder}
              onChange={(e) => setProductFilter({...productFilter, sortOrder: e.target.value as 'asc' | 'desc'})}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-amber-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Imagen</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.price}€</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProductModal(product)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-6 text-center text-gray-600">
              No se encontraron productos
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
        <button
          onClick={() => setShowOrderModal(true)}
          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
        >
          Crear Pedido Manual
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No hay pedidos disponibles
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-amber-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.id}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold">{order.customer.name}</div>
                      <div className="text-sm text-gray-600">{order.customer.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{new Date(order.date).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3 font-semibold">{order.total.toFixed(2)}€</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'En preparación' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Entregado' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En preparación">En preparación</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-amber-900">Loemi Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'products' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('products')}
          >
            📦 Productos
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'categories' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('categories')}
          >
            🗂️ Categorías
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'orders' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('orders')}
          >
            📋 Pedidos
          </button>
        </nav>
        <div className="p-4 mt-auto">
          <button
            onClick={onBack}
            className="w-full px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Volver a la Web
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {activeSection === 'products' && renderProducts()}
        {activeSection === 'categories' && renderCategories()}
        {activeSection === 'orders' && renderOrders()}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <textarea
                placeholder="Descripción"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Imagen</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="text-center text-gray-500 text-sm">o</div>
                  <input
                    type="url"
                    placeholder="URL de imagen"
                    value={productForm.image}
                    onChange={(e) => {
                      setProductForm({...productForm, image: e.target.value});
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        className="w-full h-32 object-cover rounded border"
                        onError={() => setImagePreview('')}
                      />
                    </div>
                  )}
                </div>
              </div>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value as ProductCategory})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={saveProduct}
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Crear Pedido Manual</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={orderForm.customerName}
                onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={orderForm.customerPhone}
                onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={orderForm.customerEmail}
                onChange={(e) => setOrderForm({...orderForm, customerEmail: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Productos</label>
                {orderForm.items.map((item, index) => {
                  const product = item.isCustom ? null : products.find(p => p.id === item.productId);
                  const displayName = item.isCustom ? item.customName : product?.name;
                  const basePrice = item.isCustom ? item.customPrice : parseFloat(product?.price || '0');
                  const finalPrice = item.customPrice !== undefined ? item.customPrice : basePrice;
                  
                  return (
                    <div key={index} className={`border rounded p-3 mb-3 ${item.isCustom ? 'border-blue-300 bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">{displayName}</span>
                          {item.isCustom && <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">Personalizado</span>}
                        </div>
                        <button
                          onClick={() => {
                            const newItems = orderForm.items.filter((_, i) => i !== index);
                            setOrderForm({...orderForm, items: newItems});
                          }}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...orderForm.items];
                              newItems[index].quantity = parseInt(e.target.value) || 1;
                              setOrderForm({...orderForm, items: newItems});
                            }}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{item.isCustom ? 'Precio' : 'Precio base'}</label>
                          <input
                            type="text"
                            value={`${basePrice.toFixed(2)}€`}
                            disabled={!item.isCustom}
                            className={`w-full px-2 py-1 border rounded text-sm ${item.isCustom ? '' : 'bg-gray-100'}`}
                          />
                        </div>
                        {!item.isCustom && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Precio personalizado</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={product?.price}
                              value={item.customPrice || ''}
                              onChange={(e) => {
                                const newItems = [...orderForm.items];
                                newItems[index].customPrice = e.target.value ? parseFloat(e.target.value) : undefined;
                                setOrderForm({...orderForm, items: newItems});
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Subtotal: {(finalPrice * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  );
                })}
                
                <div className="space-y-2">
                  <select
                    onChange={(e) => {
                      const productId = parseInt(e.target.value);
                      if (productId && !orderForm.items.find(item => item.productId === productId && !item.isCustom)) {
                        setOrderForm({
                          ...orderForm,
                          items: [...orderForm.items, { productId, quantity: 1 }]
                        });
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Añadir producto del catálogo...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.price}€
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setShowCustomProductForm(true)}
                    className="w-full px-3 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    + Añadir producto personalizado
                  </button>
                </div>
                
                {orderForm.items.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-lg">
                      Total: {orderForm.items.reduce((sum, item) => {
                        if (item.isCustom) {
                          return sum + ((item.customPrice || 0) * item.quantity);
                        } else {
                          const product = products.find(p => p.id === item.productId);
                          const price = item.customPrice !== undefined ? item.customPrice : parseFloat(product?.price || '0');
                          return sum + (price * item.quantity);
                        }
                      }, 0).toFixed(2)}€
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={createOrder}
                disabled={orderForm.items.length === 0}
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Crear Pedido
              </button>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setOrderForm({ customerName: '', customerPhone: '', customerEmail: '', items: [] });
                  setCustomProduct({ name: '', price: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Product Modal */}
      {showCustomProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Añadir Producto Personalizado</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={customProduct.name}
                onChange={(e) => setCustomProduct({...customProduct, name: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio"
                value={customProduct.price}
                onChange={(e) => setCustomProduct({...customProduct, price: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  if (customProduct.name && customProduct.price) {
                    setOrderForm({
                      ...orderForm,
                      items: [...orderForm.items, {
                        quantity: 1,
                        customName: customProduct.name,
                        customPrice: parseFloat(customProduct.price),
                        isCustom: true
                      }]
                    });
                    setCustomProduct({ name: '', price: '' });
                    setShowCustomProductForm(false);
                  }
                }}
                disabled={!customProduct.name || !customProduct.price}
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Añadir
              </button>
              <button
                onClick={() => {
                  setShowCustomProductForm(false);
                  setCustomProduct({ name: '', price: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;