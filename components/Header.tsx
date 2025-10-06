import React, { useState } from 'react';
import { ShoppingCartIcon } from './icons';

const navLinks = [
  { name: 'Productos', href: '#productos' },
  { name: 'Reseñas', href: '#reseñas' },
  { name: 'Contacto', href: '#contacto' },
  { name: 'Eventos', href: '#trip-form' },
];

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
    shouldAnimateCart?: boolean;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, shouldAnimateCart = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
<a href="#" className="flex-shrink-0 flex items-center space-x-2 mr-auto" style={{ height: '180px', paddingTop: '8px' }}>
  <img
    src="/loemi_logo_no_bg.png"
    alt="Loemi Artesanos Logo"
    className="h-full w-auto object-contain transition-transform duration-300 hover:scale-105"
  />
</a>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-stone-600 hover:bg-amber-100 hover:text-amber-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button data-cart-icon onClick={onCartClick} className={`relative text-stone-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-100 ${shouldAnimateCart ? 'animate-cart-vibrate' : ''}`}>
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">
                        {cartItemCount}
                    </span>
                )}
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
             <button data-cart-icon onClick={onCartClick} className={`relative text-stone-600 hover:text-amber-900 p-2 rounded-full hover:bg-amber-100 mr-2 ${shouldAnimateCart ? 'animate-cart-vibrate' : ''}`}>
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">
                        {cartItemCount}
                    </span>
                )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-stone-100 inline-flex items-center justify-center p-2 rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-100 focus:ring-amber-700"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-stone-600 hover:bg-amber-100 hover:text-amber-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
