import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import TripForm from './components/TripForm';
import Products from './components/Products';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import CustomSection from './components/CustomSection';
import Notification from './components/Notification';
import Hero from './components/Hero';
import { WhatsAppIcon } from './components/icons';
import { Product } from './types';
import { safeSetLocalStorage, safeGetLocalStorage } from './utils/storage';
import { Consultation, SectionConfig, Promotion } from './types';
import { defaultSections, getComponentForId } from './utils/sectionManager';
import './src/styles/mobile-optimizations.css';

// Default product data
const defaultProducts: Product[] = [
  { id: 1, name: 'Hogaza de Masa Madre', description: 'Pan artesanal elaborado con masa madre natural, fermentación lenta de 24 horas. Corteza crujiente y miga esponjosa.', price: '4.50', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop', category: 'Panes' },
  { id: 2, name: 'Baguette Tradicional', description: 'Baguette francesa clásica con corteza dorada y crujiente. Perfecta para acompañar cualquier comida.', price: '2.20', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop', category: 'Panes' },
  { id: 3, name: 'Pan de Centeno Integral', description: 'Pan denso y nutritivo elaborado con harina de centeno integral. Rico en fibra y sabor intenso.', price: '3.80', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop', category: 'Panes', allergens: 'Gluten', ingredients: 'Harina de centeno integral, agua, sal, levadura.' },
  { id: 4, name: 'Pan de Nueces', description: 'Pan artesanal con nueces tostadas, textura suave y sabor único. Ideal para desayunos especiales.', price: '4.20', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'Panes', allergens: 'Gluten, Frutos secos (nueces)', ingredients: 'Harina de trigo, agua, sal, levadura, nueces.' },
  { id: 5, name: 'Croissant de Mantequilla', description: 'Croissant francés hojaldrado con mantequilla de primera calidad. Crujiente por fuera, tierno por dentro.', price: '2.50', image: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5b?w=400&h=400&fit=crop', category: 'Bollería', allergens: 'Gluten, Leche, Huevo', ingredients: 'Harina de trigo, mantequilla, agua, azúcar, levadura, sal, huevo.' },
  { id: 6, name: 'Palmera de Chocolate', description: 'Hojaldre en forma de palmera bañado en chocolate negro. Un clásico irresistible de la bollería.', price: '3.20', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop', category: 'Bollería', allergens: 'Gluten, Leche, Soja', ingredients: 'Hojaldre (harina de trigo, mantequilla), chocolate negro (azúcar, pasta de cacao, manteca de cacao, lecitina de soja).' },
  { id: 7, name: 'Ensaimada Mallorquina', description: 'Ensaimada tradicional de Mallorca, esponjosa y espolvoreada con azúcar glas. Receta centenaria.', price: '4.80', image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop', category: 'Bollería', allergens: 'Gluten, Huevo, Leche', ingredients: 'Harina de trigo, azúcar, huevos, manteca de cerdo, levadura, agua, sal.' },
  { id: 8, name: 'Magdalena Casera', description: 'Magdalena esponjosa elaborada con ingredientes naturales. Sabor tradicional que recuerda a la infancia.', price: '1.80', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop', category: 'Bollería', allergens: 'Gluten, Huevo, Leche', ingredients: 'Harina de trigo, azúcar, huevos, aceite de girasol, leche, levadura, ralladura de limón.' },
  { id: 9, name: 'Tarta de Queso Cremosa', description: 'Tarta de queso cremosa con base de galleta. Textura suave y sabor equilibrado, decorada con frutos rojos.', price: '18.50', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop', category: 'Pasteles y Tartas', allergens: 'Gluten, Leche, Huevo', ingredients: 'Queso crema, nata, huevos, azúcar, galleta (harina de trigo, mantequilla), frutos rojos.' },
  { id: 10, name: 'Tarta de Chocolate Negro', description: 'Intensa tarta de chocolate negro con ganache. Para los verdaderos amantes del chocolate.', price: '22.00', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop', category: 'Pasteles y Tartas', allergens: 'Gluten, Leche, Huevo, Soja', ingredients: 'Chocolate negro, nata, huevos, azúcar, harina de trigo, mantequilla.' },
  { id: 11, name: 'Milhojas de Crema', description: 'Delicado milhojas con capas de hojaldre y crema pastelera. Espolvoreado con azúcar glas.', price: '4.50', image: 'https://images.unsplash.com/photo-1464349095431-e9a021285b5f3?w=400&h=400&fit=crop', category: 'Pasteles y Tartas', allergens: 'Gluten, Leche, Huevo', ingredients: 'Hojaldre (harina de trigo, mantequilla), crema pastelera (leche, azúcar, huevos, maicena).' },
  { id: 12, name: 'Empanada de Atún', description: 'Empanada casera rellena de atún, tomate, cebolla y pimientos. Masa crujiente y relleno sabroso.', price: '3.80', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop', category: 'Salados', allergens: 'Gluten, Pescado', ingredients: 'Harina de trigo, atún, tomate, cebolla, pimientos, aceite de oliva, sal.' },
  { id: 13, name: 'Quiche Lorraine', description: 'Quiche tradicional francesa con bacon, queso gruyère y nata. Base de masa quebrada crujiente.', price: '5.20', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop', category: 'Salados', allergens: 'Gluten, Leche, Huevo', ingredients: 'Masa quebrada (harina de trigo, mantequilla), bacon, queso Gruyère, nata, huevos.' },
  { id: 14, name: 'Focaccia de Romero', description: 'Pan plano italiano con aceite de oliva virgen extra, sal marina y romero fresco. Aromático y sabroso.', price: '4.00', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop', category: 'Salados', allergens: 'Gluten', ingredients: 'Harina de trigo, agua, levadura, aceite de oliva virgen extra, sal, romero.' },
  { id: 15, name: 'Rosquilla Glaseada', description: 'Rosquilla esponjosa con glaseado de azúcar. Un dulce tradicional perfecto para el café.', price: '2.10', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop', category: 'Bollería', allergens: 'Gluten, Leche, Huevo', ingredients: 'Harina de trigo, azúcar, huevos, leche, mantequilla, levadura, glaseado de azúcar.' }
];

// Reusable parallax layer (scroll-driven transform)
function ParallaxLayer({
  speed = 0.15,
  className = '',
  children,
  style,
  translateYOffset = 0,
}: {
  speed?: number;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  translateYOffset?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const y = window.scrollY ?? 0;
      el.style.transform = `translate3d(0, ${y * speed + translateYOffset}px, 0)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      // Limpieza de los listeners para evitar fugas de memoria
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed, translateYOffset]);

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ transform: `translate3d(0, ${translateYOffset}px, 0)`, ...style }}
    >
      {children}
    </div>
  );
}

// Decorative waves divider inspired by parallax showcases
function WavesDivider() {
  return (
    <section className="relative w-full h-24 sm:h-40 overflow-hidden bg-transparent">
      <ParallaxLayer speed={0.06} className="absolute inset-x-0 -top-4 opacity-70">
        <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-24 sm:h-40">
          <path d="M0,80 C240,160 480,0 720,60 C960,120 1200,40 1440,100 L1440,140 L0,140 Z" fill="rgba(255,255,255,0.28)" />
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={0.1} className="absolute inset-x-0 -top-6 opacity-80">
        <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-24 sm:h-40">
          <path d="M0,100 C240,140 480,40 720,80 C960,120 1200,60 1440,120 L1440,140 L0,140 Z" fill="rgba(251, 191, 36, 0.15)" />
        </svg>
      </ParallaxLayer>
      <ParallaxLayer speed={0.14} className="absolute inset-x-0 -top-8 opacity-90">
        <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-24 sm:h-40">
          <path d="M0,120 C240,100 480,80 720,110 C960,140 1200,100 1440,130 L1440,140 L0,140 Z" fill="rgba(0,0,0,0.12)" />
        </svg>
      </ParallaxLayer>
    </section>
  );
}

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
  const [isAdmin, setIsAdmin] = useState(false); // Mantener isAdmin para el dashboard
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [notification, setNotification] = useState<{ message: string, isVisible: boolean }>({ message: '', isVisible: false });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [categories, setCategories] = useState<string[]>(['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados']);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Forzar carga de productos nuevos
    try {
      // Cargar productos desde localStorage o usar los por defecto si no existen
      const storedProducts = safeGetLocalStorage<Product[]>('loemi-products', []);
      if (storedProducts.length === 0) {
        setProducts(defaultProducts);
        safeSetLocalStorage('loemi-products', defaultProducts);
      } else {
        setProducts(storedProducts);
      }

      const storedConsultations = safeGetLocalStorage<Consultation[]>('loemi-consultations', []);
      setConsultations(storedConsultations);

      const storedSections = safeGetLocalStorage<SectionConfig[]>('loemi-sections', defaultSections);
      setSections(storedSections);

      const storedPromotions = safeGetLocalStorage<Promotion[]>('loemi-promotions', []);
      const today = new Date().toISOString().split('T')[0];

      const productsWithPromotions = storedProducts.map(p => {
        const activePromotion = storedPromotions.find(promo => 
          promo.productId === p.id &&
          new Date(promo.startDate) <= new Date(today) &&
          (!promo.endDate || new Date(promo.endDate) >= new Date(today))
        );

        if (activePromotion) {
          if (activePromotion.type === '2x1') {
            return { ...p, promotionType: '2x1' };
          } else {
            const originalPrice = parseFloat(p.price);
            const newPrice = activePromotion.newPrice !== undefined 
              ? activePromotion.newPrice 
              : originalPrice * (1 - (activePromotion.discountPercentage || 0) / 100);
            return { ...p, price: newPrice.toFixed(2), originalPrice: p.price };
          }
        }
        return { ...p, originalPrice: undefined };
      });
      setProducts(productsWithPromotions);
      const storedCategories = safeGetLocalStorage<string[]>('loemi-categories', ['Panes', 'Bollería', 'Pasteles y Tartas', 'Salados']);
      setCategories(storedCategories);
    } catch (error) {
      console.error("Error al inicializar la app:", error);
    }
  }, []);

  const handleConsultationSubmit = (data: { name: string; email: string; message: string }) => {
    const newConsultation: Consultation = {
      id: Date.now(),
      ...data,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updatedConsultations = [...consultations, newConsultation];
    setConsultations(updatedConsultations);
    safeSetLocalStorage('loemi-consultations', updatedConsultations);
    
    setNotification({ message: '¡Consulta enviada! Gracias.', isVisible: true });
  };

  if (isAdmin) {
    return <AdminDashboard 
              onBack={() => { setIsAdmin(false); setShowAdminLogin(false); }} 
              onSectionsUpdate={setSections} 
              initialProducts={products}
              initialCategories={categories}
              onProductsUpdate={setProducts}
              onCategoriesUpdate={setCategories}
           />;
  }

  if (showAdminLogin) {
    return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} onBack={() => setShowAdminLogin(false)} />;
  }

  return (
    <div className="bg-stone-100 min-h-screen w-full overflow-x-hidden">
      <Header />
      <main>
        {/* Hero con profundidad */}
        <div className="relative bg-black">
          <Hero />          
        </div>

        {sections.map(section => {
          if (!section.enabled) return null;
          const Component = getComponentForId(section.id);
          if (!Component) return null;

          const props: any = { title: section.title };
          if (section.id === 'products') {
            props.products = products;
            props.categories = categories;
          }
          if (section.id === 'tripForm') props.onFormSubmit = handleConsultationSubmit;
          if (section.id.startsWith('custom-')) {
            props.content = section.content;
            props.products = products;
          }

          return (
            <Component key={section.id} {...props} />
          );
        })}
      </main>
      
      {/* Video parallax adicional a mitad de página */}
      <section className="relative w-full h-64 sm:h-96 lg:h-screen overflow-hidden">
        <ParallaxLayer speed={0.02} className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
            style={{ 
              transform: 'translateZ(0)',
              filter: 'brightness(0.65)'
            }}
          >
            <source src="/media/video_bucle_gente_pasando.mp4" type="video/mp4" />
          </video>
        </ParallaxLayer>
        <ParallaxLayer speed={0.08} className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-stone-800/20 to-stone-800" />
        </ParallaxLayer>
        <ParallaxLayer speed={0.12} className="relative z-10 h-full flex items-center justify-center">
          <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-center text-amber-50 shadow-xl">
            <span className="text-sm sm:text-base">Hecho a mano, pensado para ti</span>
          </div>
        </ParallaxLayer>
      </section>
      
      <Footer onAdminClick={() => setShowAdminLogin(true)} />
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default App;
