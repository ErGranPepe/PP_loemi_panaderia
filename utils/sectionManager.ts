import React from 'react';
import Products from '../components/Products';
import Testimonials from '../components/Testimonials';
import Location from '../components/Location';
import TripForm from '../components/TripForm';
import CustomSection from '../components/CustomSection';
import { SectionConfig } from '../types';

export const defaultSections: SectionConfig[] = [
  {
    id: 'products',
    name: 'Productos',
    title: 'Nuestros Productos',
    enabled: true,
    editableTitle: true,
    content: '',
    bgClass: 'relative bg-gradient-to-b from-stone-50 to-stone-100 z-10',
  },
  {
    id: 'testimonials',
    name: 'Reseñas',
    title: 'Lo que dicen nuestros clientes',
    enabled: true,
    editableTitle: true,
    content: '',
    bgClass: 'bg-white',
  },
  {
    id: 'location',
    name: 'Ubicación',
    title: 'Visítanos en Móstoles',
    enabled: true,
    editableTitle: true,
    content: '',
    bgClass: 'bg-stone-50',
  },
  {
    id: 'tripForm',
    name: 'Formulario de Eventos',
    title: '¿Planeando un evento?',
    enabled: true,
    editableTitle: true,
    content: '',
    bgClass: 'bg-white',
  },
];

export const componentMap: { [key: string]: React.FC<any> } = {
  products: Products,
  testimonials: Testimonials,
  location: Location,
  tripForm: TripForm,
};

export const getComponentForId = (id: string): React.FC<any> | null => {
  if (id.startsWith('custom-')) return CustomSection;
  return componentMap[id] || null;
};