import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import TripForm from './components/TripForm';
import ChatWindow from './components/ChatWindow';
import Products from './components/Products';
import ProductModal from './components/ProductModal';
import AdminDashboard from './components/AdminDashboard';
import Notification from './components/Notification';
import Hero from './components/Hero';
import { WhatsAppIcon } from './components/icons';
import { Product } from './types';
import RotatingBread from './components/RotatingBread';
import './src/styles/mobile-optimizations.css';

// Default product data
const defaultProducts: Product[] = [
  { id: 1, name: 'Hogaza de Masa Madre', description: 'Pan artesanal elaborado con masa madre natural, fermentación lenta de 24 horas. Corteza crujiente y miga esponjosa.', price: '4.50', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop', category: 'Panes' },
  { id: 2, name: 'Baguette Tradicional', description: 'Baguette francesa clásica con corteza dorada y crujiente. Perfecta para acompañar cualquier comida.', price: '2.20', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', category: 'Panes' },
  { id: 3, name: 'Pan de Centeno Integral', description: 'Pan denso y nutritivo elaborado con harina de centeno integral. Rico en fibra y sabor intenso.', price: '3.80', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop', category: 'Panes' },
  { id: 4, name: 'Pan de Nueces', description: 'Pan artesanal con nueces tostadas, textura suave y sabor único. Ideal para desayunos especiales.', price: '4.20', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Panes' },
  { id: 5, name: 'Croissant de Mantequilla', description: 'Croissant francés hojaldrado con mantequilla de primera calidad. Crujiente por fuera, tierno por dentro.', price: '2.50', image: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5b?w=400&h=400&fit=crop', category: 'Bollería' },
  { id: 6, name: 'Palmera de Chocolate', description: 'Hojaldre en forma de palmera bañado en chocolate negro. Un clásico irresistible de la bollería.', price: '3.20', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop', category: 'Bollería' },
  { id: 7, name: 'Ensaimada Mallorquina', description: 'Ensaimada tradicional de Mallorca, esponjosa y espolvoreada con azúcar glas. Receta centenaria.', price: '4.80', image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop', category: 'Bollería' },
  { id: 8, name: 'Magdalena Casera', description: 'Magdalena esponjosa elaborada con ingredientes naturales. Sabor tradicional que recuerda a la infancia.', price: '1.80', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop', category: 'Bollería' },
  { id: 9, name: 'Tarta de Queso Cremosa', description: 'Tarta de queso cremosa con base de galleta. Textura suave y sabor equilibrado, decorada con frutos rojos.', price: '18.50', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop', category: 'Pasteles y Tartas' },
  { id: 10, name: 'Tarta de Chocolate Negro', description: 'Intensa tarta de chocolate negro con ganache. Para los verdaderos amantes del chocolate.', price: '22.00', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop', category: 'Pasteles y Tartas' },
  { id: 11, name: 'Milhojas de Crema', description: 'Delicado milhojas con capas de hojaldre y crema pastelera. Espolvoreado con azúcar glas.', price: '4.50', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop', category: 'Pasteles y Tartas' },
  { id: 12, name: 'Empanada de Atún', description: 'Empanada casera rellena de atún, tomate, cebolla y pimientos. Masa crujiente y relleno sabroso.', price: '3.80', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop', category: 'Salados' },
  { id: 13, name: 'Quiche Lorraine', description: 'Quiche tradicional francesa con bacon, queso gruyère y nata. Base de masa quebrada crujiente.', price: '5.20', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop', category: 'Salados' },
  { id: 14, name: 'Focaccia de Romero', description: 'Pan plano italiano con aceite de oliva virgen extra, sal marina y romero fresco. Aromático y sabroso.', price: '4.00', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop', category: 'Salados' },
  { id: 15, name: 'Rosquilla Glaseada', description: 'Rosquilla esponjosa con glaseado de azúcar. Un dulce tradicional perfecto para el café.', price: '2.10', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop', category: 'Bollería' }
];




const Footer: React.FC<{ onAdminClick: () => void }> = ({ onAdminClick }) => (
  <footer className="bg-stone-800 text-stone-300">
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-lg font-semibold text-white">Loemi Artesanos</h3>
          <p className="mt-2 text-sm">Pasión por el pan desde 1998.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Navegación</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><a href="#productos" className="hover:text-amber-400">Productos</a></li>
            <li><a href="#reseñas" className="hover:text-amber-400">Reseñas</a></li>
            <li><a href="#contacto" className="hover:text-amber-400">Contacto</a></li>
            <li><a href="#trip-form" className="hover:text-amber-400">Eventos</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Contacta con nosotros</h3>
           <a href="https://wa.me/34912345678" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center space-x-2 hover:text-amber-400">
              <WhatsAppIcon className="w-5 h-5" />
              <span>WhatsApp</span>
           </a>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-stone-700 text-center text-sm text-stone-400">
        <p>&copy; {new Date().getFullYear()} Loemi Artesanos. Todos los derechos reservados.</p>
        <button onClick={onAdminClick} className="mt-2 text-xs text-stone-500 hover:text-stone-300">Admin</button>
      </div>
    </div>
  </footer>
);


function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{message: string, isVisible: boolean}>({message: '', isVisible: false});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsEditMode(params.get('edit') === 'true');

    // Forzar carga de productos nuevos
    setProducts(defaultProducts);
    localStorage.setItem('loemi-products', JSON.stringify(defaultProducts));
  }, []);



  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
        const isEditing = prev.some(p => p.id === product.id);
        if (isEditing) {
            return prev.map(p => p.id === product.id ? product : p);
        } else {
            return [...prev, { ...product, id: Date.now() }];
        }
    });
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
      setEditingProduct(product);
      setIsModalOpen(true);
  };

  const handleAddNewProduct = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
      if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
          setProducts(prev => prev.filter(p => p.id !== productId));
      }
  };

  if (isAdmin) {
    return <AdminDashboard onBack={() => setIsAdmin(false)} />;
  }

  return (
    <div className="bg-stone-100">
      <Header />
      <main>
        <div className="relative bg-black">
          <Hero />
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <RotatingBread />
          </div>
        </div>
        <div className="relative">
          <Products
            products={products}
            isEditMode={isEditMode}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAdd={handleAddNewProduct}
          />
        </div>
        <Testimonials />
        <Location />
        <TripForm />
      </main>
      
      {/* Video parallax simple */}
      <div className="relative w-full h-64 sm:h-96 lg:h-screen overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover transform scale-105"
          style={{ 
            transform: 'translateZ(0)',
            filter: 'brightness(0.6)'
          }}
        >
          <source src="/media/video_bucle_gente_pasando.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-800/20 to-stone-800"></div>
      </div>
      
      <Footer onAdminClick={() => setIsAdmin(true)} />
      <ChatWindow />

      {isModalOpen && (
          <ProductModal
            product={editingProduct}
            onClose={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
      )}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default App;
