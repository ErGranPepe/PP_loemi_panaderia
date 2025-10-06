import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

const categories: ProductCategory[] = ['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Panes' as ProductCategory,
    stockStatus: 'En stock',
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('products');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const storedProducts = localStorage.getItem('loemi-products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortKey, sortOrder]);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('loemi-products', JSON.stringify(newProducts));
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    filtered.sort((a, b) => {
      let aKey = a[sortKey as keyof Product];
      let bKey = b[sortKey as keyof Product];
      if (typeof aKey === 'string' && typeof bKey === 'string') {
        if (sortOrder === 'asc') return aKey.localeCompare(bKey);
        else return bKey.localeCompare(aKey);
      }
      return 0;
    });
    setFilteredProducts(filtered);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stockStatus: (product as any).stockStatus || 'En stock',
    });
    setImagePreview(product.image);
    setImageFile(null);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Panes',
      stockStatus: 'En stock',
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const newProducts = products.filter(p => p.id !== productToDelete.id);
      saveProducts(newProducts);
      setNotification('Producto eliminado con éxito');
    }
    setShowConfirm(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setProductToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product & { stockStatus?: string } = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      image: formData.image,
      category: formData.category,
      stockStatus: formData.stockStatus,
    };
    let newProducts;
    if (editingProduct) {
      newProducts = products.map(p => p.id === editingProduct.id ? product : p);
      setNotification('Producto actualizado con éxito');
    } else {
      newProducts = [...products, product];
      setNotification('Producto añadido con éxito');
    }
    saveProducts(newProducts);
    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case 'En stock': return 'badge-success';
      case 'Agotado': return 'badge-error';
      case 'Por encargo': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const renderProductsSection = () => (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center mb-4 space-x-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="select select-bordered"
        >
          <option value="All">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-amber-900 text-white">
              <th className="w-16">Foto</th>
              <th
                className="cursor-pointer hover:bg-amber-800"
                onClick={() => toggleSort('name')}
              >
                Nombre {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className="cursor-pointer hover:bg-amber-800"
                onClick={() => toggleSort('price')}
              >
                Precio {sortKey === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Categoría</th>
              <th>Stock</th>
              <th className="w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-stone-600">
                  No se encontraron productos.
                </td>
              </tr>
            )}
            {filteredProducts.map((product, index) => (
              <tr key={product.id} className="hover:bg-amber-50">
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>
                <td className="font-semibold">{product.name}</td>
                <td>{product.price}€</td>
                <td>{product.category}</td>
                <td>
                  <span className={`badge ${getStockBadgeColor((product as any).stockStatus || 'En stock')}`}>
                    {(product as any).stockStatus || 'En stock'}
                  </span>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="btn btn-sm btn-outline btn-info tooltip"
                      data-tip="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="btn btn-sm btn-outline btn-error tooltip"
                      data-tip="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderStatisticsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-amber-900">Total Productos</h3>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
      </div>
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-amber-900">Categorías</h3>
          <p className="text-3xl font-bold">{categories.length}</p>
        </div>
      </div>
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-amber-900">En Stock</h3>
          <p className="text-3xl font-bold">
            {products.filter(p => (p as any).stockStatus !== 'Agotado').length}
          </p>
        </div>
      </div>
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-amber-900">Agotados</h3>
          <p className="text-3xl font-bold">
            {products.filter(p => (p as any).stockStatus === 'Agotado').length}
          </p>
        </div>
      </div>
    </div>
  );

  const renderOrdersSection = () => {
    // Mock data for orders
    const mockOrders = [
      {
        id: 'ORD-001',
        customer: { name: 'María García', email: 'maria@email.com', phone: '600123456' },
        date: '2024-01-15',
        status: 'Pendiente',
        total: 25.50,
        items: [
          { name: 'Hogaza de Masa Madre', quantity: 2, price: 3.20 },
          { name: 'Croissant de Mantequilla', quantity: 1, price: 1.50 }
        ]
      },
      {
        id: 'ORD-002',
        customer: { name: 'Carlos López', email: 'carlos@email.com', phone: '600234567' },
        date: '2024-01-14',
        status: 'En preparación',
        total: 18.00,
        items: [
          { name: 'Baguette Tradicional', quantity: 3, price: 1.00 },
          { name: 'Tarta de Queso Cremosa', quantity: 1, price: 15.00 }
        ]
      },
      {
        id: 'ORD-003',
        customer: { name: 'Ana Martínez', email: 'ana@email.com', phone: '600345678' },
        date: '2024-01-13',
        status: 'Entregado',
        total: 12.50,
        items: [
          { name: 'Empanada de Atún', quantity: 1, price: 8.50 },
          { name: 'Croissant de Mantequilla', quantity: 2, price: 1.50 }
        ]
      }
    ];

    const getOrderStatusColor = (status: string) => {
      switch (status) {
        case 'Pendiente': return 'badge-warning';
        case 'En preparación': return 'badge-info';
        case 'Entregado': return 'badge-success';
        case 'Cancelado': return 'badge-error';
        default: return 'badge-neutral';
      }
    };

    return (
      <>
        {/* Filters */}
        <div className="flex flex-wrap items-center mb-4 space-x-4 bg-white p-4 rounded-lg shadow">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar por cliente o nº pedido..."
              className="input input-bordered w-full"
            />
          </div>
          <select className="select select-bordered">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="preparing">En preparación</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <input
            type="date"
            className="input input-bordered"
            placeholder="Fecha desde"
          />
          <input
            type="date"
            className="input input-bordered"
            placeholder="Fecha hasta"
          />
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-amber-900 text-white">
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th className="w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50">
                  <td className="font-semibold">{order.id}</td>
                  <td>
                    <div>
                      <div className="font-semibold">{order.customer.name}</div>
                      <div className="text-sm text-stone-600">{order.customer.email}</div>
                    </div>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString('es-ES')}</td>
                  <td>
                    <span className={`badge ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="font-semibold">{order.total.toFixed(2)}€</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        className="btn btn-sm btn-outline btn-info tooltip"
                        data-tip="Ver detalle"
                      >
                        👁️
                      </button>
                      <select className="select select-xs select-bordered">
                        <option value={order.status}>{order.status}</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En preparación">En preparación</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-stone-200 font-bold text-xl text-amber-900">
          Loemi Admin
        </div>
        <nav className="flex flex-col flex-grow p-4 space-y-2">
          <button
            className={`text-left px-3 py-2 rounded hover:bg-amber-100 font-semibold ${
              activeSection === 'products' ? 'bg-amber-200 text-amber-900' : 'text-stone-700'
            }`}
            onClick={() => setActiveSection('products')}
          >
            📦 Productos
          </button>
          <button
            className={`text-left px-3 py-2 rounded hover:bg-amber-100 font-semibold ${
              activeSection === 'categories' ? 'bg-amber-200 text-amber-900' : 'text-stone-700'
            }`}
            onClick={() => setActiveSection('categories')}
          >
            🗂️ Categorías
          </button>
          <button
            className={`text-left px-3 py-2 rounded hover:bg-amber-100 font-semibold ${
              activeSection === 'orders' ? 'bg-amber-200 text-amber-900' : 'text-stone-700'
            }`}
            onClick={() => setActiveSection('orders')}
          >
            🛒 Pedidos
          </button>
          <button
            className={`text-left px-3 py-2 rounded hover:bg-amber-100 font-semibold ${
              activeSection === 'users' ? 'bg-amber-200 text-amber-900' : 'text-stone-700'
            }`}
            onClick={() => setActiveSection('users')}
          >
            👤 Usuarios
          </button>
          <button
            className={`text-left px-3 py-2 rounded hover:bg-amber-100 font-semibold ${
              activeSection === 'stats' ? 'bg-amber-200 text-amber-900' : 'text-stone-700'
            }`}
            onClick={() => setActiveSection('stats')}
          >
            📊 Estadísticas
          </button>
        </nav>
        <button
          className="m-4 px-3 py-2 bg-stone-300 rounded hover:bg-stone-400"
          onClick={onBack}
        >
          Volver a la Web
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-stone-800">
            {activeSection === 'products' && 'Gestión de Productos'}
            {activeSection === 'categories' && 'Gestión de Categorías'}
            {activeSection === 'orders' && 'Gestión de Pedidos'}
            {activeSection === 'users' && 'Gestión de Usuarios'}
            {activeSection === 'stats' && 'Estadísticas'}
          </h1>
          {activeSection === 'products' && (
            <button
              onClick={openAddModal}
              className="btn btn-primary btn-lg fixed top-6 right-6 z-10 shadow-lg"
            >
              ➕ Añadir Producto
            </button>
          )}
        </div>

        {activeSection === 'products' && renderProductsSection()}
        {activeSection === 'stats' && renderStatisticsSection()}
        {activeSection === 'categories' && (
          <div className="text-center py-12">
            <p className="text-stone-600">Gestión de categorías próximamente...</p>
          </div>
        )}
        {activeSection === 'orders' && renderOrdersSection()}
        {activeSection === 'users' && (
          <div className="text-center py-12">
            <p className="text-stone-600">Gestión de usuarios próximamente...</p>
          </div>
        )}

        {/* Edit/Add Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-lg">
              <h3 className="font-bold text-lg mb-4">
                {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
              </h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Nombre</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Descripción</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows={3}
                    className="textarea textarea-bordered w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Precio (€)</span>
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                      placeholder="3.50"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Categoría</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="select select-bordered w-full"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}></option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Imagen del Producto</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered w-full"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-24 h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Estado de Stock</span>
                  </label>
                  <select
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleFormChange}
                    className="select select-bordered w-full"
                  >
                    <option value="En stock">En stock</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Por encargo">Por encargo</option>
                  </select>
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingProduct ? 'Actualizar' : 'Añadir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showConfirm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirmar eliminación</h3>
              <p className="py-4">
                ¿Seguro que quieres eliminar el producto <strong>{productToDelete?.name}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="modal-action">
                <button
                  onClick={cancelDelete}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-error"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {notification && (
          <div className="toast toast-top toast-end z-50">
            <div className="alert alert-success">
              <span>{notification}</span>
              <button
                onClick={closeNotification}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
