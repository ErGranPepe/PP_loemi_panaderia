import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import TripForm from './components/TripForm';
import ChatWindow from './components/ChatWindow';
import Products from './components/Products';
import ShoppingCart from './components/ShoppingCart';
import ProductModal from './components/ProductModal';
import AdminDashboard from './components/AdminDashboard';
import Notification from './components/Notification';
import Hero from './components/Hero';
import { WhatsAppIcon } from './components/icons';
import { Product, CartItem } from './types';
import RotatingBread from './components/RotatingBread';

// Default product data
const defaultProducts: Product[] = [
  { id: 1, name: 'Hogaza de Masa Madre', description: 'Pan artesanal con fermentación lenta de 24 horas. Su corteza crujiente libera aromas intensos, mientras la miga alveolada y esponjosa invita a saborear cada bocado con mantequilla fundida.', price: '3.20', image: 'https://cdn.pixabay.com/photo/2017/05/07/08/56/bread-2291908_1280.jpg', category: 'Panes' },
  { id: 2, name: 'Croissant de Mantequilla', description: 'Hojaldre artesanal elaborado con capas de mantequilla pura que se derriten en la boca. Su textura crujiente por fuera y tierna por dentro evoca el aroma matutino de las mejores boulangeries francesas.', price: '1.50', image: 'https://cdn.pixabay.com/photo/2017/01/20/00/30/croissant-1995056_1280.jpg', category: 'Bollería' },
  { id: 3, name: 'Tarta de Queso Cremosa', description: 'Crema de queso fresco batida a mano con un toque de vainilla y limón. Su base de galleta crujiente contrasta con la suavidad sedosa, coronada por un ligero dorado que invita a repetir.', price: '15.00', image: 'https://cdn.pixabay.com/photo/2017/05/07/08/56/cheesecake-2291907_1280.jpg', category: 'Pasteles y Tartas' },
  { id: 4, name: 'Empanada de Atún', description: 'Masa artesanal rellena de atún fresco, pimiento rojo asado y cebolla caramelizada. Cada bocado combina la jugosidad del mar con el aroma tostado de la masa horneada al momento.', price: '8.50', image: 'https://cdn.pixabay.com/photo/2017/01/20/00/30/empanada-1995057_1280.jpg', category: 'Salados' },
  { id: 5, name: 'Baguette Tradicional', description: 'Barra francesa con corteza dorada y crujiente que canta al partirla. Su interior esponjoso y ligeramente ácido invita a acompañar quesos curados o simplemente untada con aceite de oliva virgen.', price: '1.00', image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/baguette-1239437_1280.jpg', category: 'Panes' },
  { id: 6, name: 'Palmera de Chocolate', description: 'Hojaldre enrollado con chocolate negro fundido que se derrite en la boca. La combinación de capas crujientes y el intenso sabor del cacao puro crea una experiencia irresistible.', price: '1.80', image: 'https://cdn.pixabay.com/photo/2017/01/20/00/30/pastry-1995058_1280.jpg', category: 'Bollería' },
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<{message: string, isVisible: boolean}>({message: '', isVisible: false});
  const [shouldAnimateCart, setShouldAnimateCart] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsEditMode(params.get('edit') === 'true');

    // Load products from localStorage or use defaults
    const storedProducts = localStorage.getItem('loemi-products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(defaultProducts);
      localStorage.setItem('loemi-products', JSON.stringify(defaultProducts));
    }
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
        const exist = prevItems.find(item => item.id === product.id);
        if (exist) {
            return prevItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
            return [...prevItems, { ...product, quantity: 1 }];
        }
    });

    // Show notification
    setNotification({
      message: `Añadido: ${product.name} (${product.price}€)`,
      isVisible: true
    });

    // Animate cart icon
    setShouldAnimateCart(true);
    setTimeout(() => setShouldAnimateCart(false), 600);

    setIsCartOpen(true);
  }, []);

  const handleUpdateQuantity = useCallback((productId: number, quantity: number) => {
      setCartItems(prevItems => {
          if (quantity <= 0) {
              return prevItems.filter(item => item.id !== productId);
          }
          return prevItems.map(item => item.id === productId ? { ...item, quantity } : item);
      });
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
      <Header
        cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(!isCartOpen)}
        shouldAnimateCart={shouldAnimateCart}
      />
      <main>
        <div className="relative bg-black">
          <Hero />
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <RotatingBread />
          </div>
        </div>
        <Products
          products={products}
          onAddToCart={handleAddToCart}
          isEditMode={isEditMode}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onAdd={handleAddNewProduct}
        />
        <Testimonials />
        <Location />
        <TripForm />
      </main>
      <Footer onAdminClick={() => setIsAdmin(true)} />
      <ChatWindow />
      <ShoppingCart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
      />
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
