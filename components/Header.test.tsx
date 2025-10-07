import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';

// Mock para IntersectionObserver, que no existe en el entorno de prueba (jsdom)
const MockIntersectionObserver = vi.fn(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}));

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

describe('Header Component', () => {
  it('debería renderizar todos los enlaces de navegación', () => {
    render(<Header />);

    expect(screen.getByText('Productos')).toBeDefined();
    expect(screen.getByText('Reseñas')).toBeDefined();
    expect(screen.getByText('Contacto')).toBeDefined();
    expect(screen.getByText('Eventos')).toBeDefined();
  });
});