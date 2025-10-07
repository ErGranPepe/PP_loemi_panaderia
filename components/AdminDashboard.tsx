import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Product, ProductCategory, Order, Consultation } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';
import { OrderManager } from '../utils/orderManager';
import campaignsData from '../data/campaigns.json';
import EventEditModal from './EventEditModal';
import EventDetailModal from './EventDetailModal';
import inventoryData from '../data/inventory.json';
import {
  defaultSections,
  SectionConfig,
  ContentBlock, Promotion, PromotionType,
} from '../utils/sectionManager';
import TiptapEditor from './TiptapEditor';

interface SortableSectionItemProps {
  section: SectionConfig;
  onToggle: (id: string) => void;
  onChange: (id: string, field: keyof SectionConfig, value: any) => void;
  onDelete: (id: string) => void;
  onAddBlock: (sectionId: string, type: ContentBlock['type']) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onBlockChange: (sectionId: string, blockId: string, content: any) => void;
  onBlockMove: (sectionId: string, oldIndex: number, newIndex: number) => void;
  products: Product[];
  sensors: any;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({ section, onToggle, onChange, onDelete, onAddBlock, onDeleteBlock, onBlockChange, onBlockMove, products }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = section.content?.findIndex(b => b.id === active.id) ?? -1;
      const newIndex = section.content?.findIndex(b => b.id === over.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) onBlockMove(section.id, oldIndex, newIndex);
    }
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4 touch-none">
      <div {...listeners} className="cursor-grab text-stone-400 hover:text-stone-600 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-stone-800">{section.name}</p>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange(section.id, 'title', e.target.value)}
          className="w-full text-sm text-stone-600 bg-stone-100/50 border-b border-transparent focus:border-amber-500 focus:outline-none"
          disabled={!section.editableTitle}
        />
      </div>
      <div
        onClick={() => onToggle(section.id)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${section.enabled ? 'bg-amber-700' : 'bg-stone-300'}`}
      >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${section.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
      <div className="ml-2">
        <button onClick={() => onDelete(section.id)} className="p-2 text-stone-400 hover:text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

const SortableBlockItem: React.FC<{ block: ContentBlock, products: Product[], onChange: (content: any) => void, onDelete: () => void }> = ({ block, products, onChange, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return <TiptapEditor content={block.value} onChange={onChange} />;
      case 'product':
        return (
          <select value={block.value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Selecciona un producto</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        );
      case 'image':
        return <input type="url" value={block.value} onChange={(e) => onChange(e.target.value)} placeholder="URL de la imagen" className="w-full p-2 border rounded" />;
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="bg-stone-50 p-2 rounded border flex items-center gap-2">
      <div {...listeners} className="cursor-grab text-stone-400 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg></div>
      <div className="flex-grow">{renderBlockContent()}</div>
      <button onClick={onDelete} className="p-1 text-stone-400 hover:text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

interface AdminDashboardProps {
  onBack: () => void;
  onSectionsUpdate: (sections: SectionConfig[]) => void;
  initialProducts: Product[];
  initialCategories: string[];
  onProductsUpdate: (products: Product[]) => void;
  onCategoriesUpdate: (categories: string[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onSectionsUpdate, initialProducts, initialCategories, onProductsUpdate, onCategoriesUpdate }) => {
  const [activeSection, setActiveSection] = useState('calendar'); // Vista inicial: Calendario
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderManager] = useState(() => OrderManager.getInstance());
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEventEditModal, setShowEventEditModal] = useState(false);
  const [editingEventInfo, setEditingEventInfo] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [weeklySummary, setWeeklySummary] = useState({ orders: 0, productions: 0, lowStock: 0, nextCampaign: 'Ninguna' });
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [localSections, setLocalSections] = useState<SectionConfig[]>([]);
  const [initialSections, setInitialSections] = useState<SectionConfig[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Panes' as ProductCategory,
    allergens: '',
    ingredients: '',
    stock: 0,
    cost: 0,
    isFeatured: false,
    isSeasonal: false,
    productionTimeDays: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryDate: new Date().toISOString().split('T')[0],
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
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotionForm, setPromotionForm] = useState({
    productId: '',
    type: 'discount' as PromotionType,
    discountPercentage: '',
    newPrice: '',
    startDate: '',
    endDate: '',
  });


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Carga de datos inicial
    const storedOrders = safeGetLocalStorage<Order[]>('loemi-orders', []);
    const storedConsultations = safeGetLocalStorage<Consultation[]>('loemi-consultations', []);
    const storedCustomEvents = safeGetLocalStorage<any[]>('loemi-custom-events', []);
    const storedSections = safeGetLocalStorage<SectionConfig[]>('loemi-sections', JSON.parse(JSON.stringify(defaultSections)));
    const storedPromotions = safeGetLocalStorage<Promotion[]>('loemi-promotions', []);

    setOrders(storedOrders);
    setConsultations(storedConsultations);
    setLocalSections(storedSections);
    setPromotions(storedPromotions);
    setInitialSections(JSON.parse(JSON.stringify(storedSections))); // Deep copy for reset

    // Transformar datos para el calendario
    const orderEvents = storedOrders.map(order => ({
      title: `🚚 Entrega: ${order.customer.name}`,
      start: order.date,
      backgroundColor: '#bbf7d0', // Verde
      borderColor: '#22c55e',
      textColor: '#15803d',
      id: `order-${order.id}`,
      extendedProps: { type: 'order', data: order, custom: false }
    }));

    const consultationEvents = storedConsultations.map(c => ({
      title: `✉️ Consulta: ${c.name}`,
      start: c.timestamp,
      backgroundColor: '#ddd6fe', // Morado claro
      borderColor: '#8b5cf6',
      textColor: '#6d28d9',
      id: `consultation-${c.id}`,
      extendedProps: { type: 'consultation', data: c, custom: false }
    }));

    const campaignEvents = campaignsData.map(c => ({
      title: `🎉 Campaña ${c.name}`,
      start: c.start,
      end: c.end,
      backgroundColor: '#fed7aa', // Naranja
      borderColor: '#f97316',
      textColor: '#b45309',
      id: `campaign-${c.name}`,
      extendedProps: { type: 'campaign', custom: false }
    }));

    // Cargar festivos de España para 2025
    fetch('https://date.nager.at/api/v3/PublicHolidays/2025/ES')
      .then(res => res.json())
      .then(holidays => {
        const holidayEvents = holidays.map((h: any, index: number) => ({
          title: `🚫 ${h.localName}`,
          start: h.date,
          allDay: true,
          backgroundColor: '#fecaca', // Rojo claro
          borderColor: '#ef4444',
          textColor: '#b91c1c',
          display: 'block',
          id: `holiday-${index}`,
          extendedProps: { type: 'holiday', custom: false }
        }));
        setCalendarEvents(prev => [...orderEvents, ...consultationEvents, ...campaignEvents, ...holidayEvents, ...storedCustomEvents.filter(e => !prev.some(p => p.id === e.id))]);
      })
      .catch(error => {
        console.error("Error fetching holidays:", error);
      });

  }, [orderManager]);

  const saveProducts = (newProducts: Product[]) => {
    safeSetLocalStorage('loemi-products', newProducts);
    onProductsUpdate(newProducts);
    setProducts(newProducts);
  };

  const saveCategories = (newCategories: string[]) => {
    safeSetLocalStorage('loemi-categories', newCategories);
    onCategoriesUpdate(newCategories);
    setCategories(newCategories);
  };

  const savePromotions = (newPromotions: Promotion[]) => {
    safeSetLocalStorage('loemi-promotions', newPromotions);
    setPromotions(newPromotions);
    // No need to call back to App.tsx for now, as promotions are handled within AdminDashboard and then applied to products on the main page.
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      saveCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const deleteCategory = (category: string) => {
    if (window.confirm(`¿Seguro que quieres eliminar la categoría "${category}"?`)) {
      const newCategories = categories.filter(c => c !== category);
      saveCategories(newCategories);
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
        category: product.category,
        allergens: product.allergens || '',
        ingredients: product.ingredients || '',
        stock: product.stock || 0,
        cost: product.cost || 0,
        isFeatured: product.isFeatured || false,
        isSeasonal: product.isSeasonal || false,
        productionTimeDays: product.productionTimeDays || 1,
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Panes',
        allergens: '',
        ingredients: '',
        stock: 0,
        cost: 0,
        isFeatured: false,
        isSeasonal: false,
        productionTimeDays: 1,
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
    setShowOrderModal(false); // Cierra el modal
    setOrderForm({ customerName: '', customerPhone: '', customerEmail: '', deliveryDate: new Date().toISOString().split('T')[0], items: [] }); // Resetea el formulario
    setCustomProduct({ name: '', price: '' });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    orderManager.updateOrderStatus(orderId, status);
    setOrders(orderManager.getOrders());
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleSelectDate = (selectInfo: any) => {
    setEditingEventInfo(selectInfo);
    setShowEventEditModal(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(null); // Cierra el modal de detalle
    setEditingEventInfo({ event }); // Abre el modal de edición
    setShowEventEditModal(true);
  };

  const handleDeleteEvent = (event: any) => {
    if (window.confirm(`¿Seguro que quieres eliminar el evento "${event.title}"?`)) {
      let eventsToDelete = [event.id];
      // Si es una entrega, buscar y eliminar su evento de producción
      if (event.extendedProps.type === 'order') {
        const productionEventId = `production-${event.id.split('-')[1]}`;
        eventsToDelete.push(productionEventId);
      }

      const newEvents = calendarEvents.filter(e => !eventsToDelete.includes(e.id));
      setCalendarEvents(newEvents);
      
      // Persistir solo los eventos personalizados
      const customEvents = newEvents.filter(e => e.extendedProps.custom);
      safeSetLocalStorage('loemi-custom-events', customEvents);

      setSelectedEvent(null);
    }
  };

  const handleSaveEvent = (eventData: { id: string, title: string, start: string, end: string, allDay: boolean }) => {
    setCalendarEvents(prevEvents => {
      const existingEventIndex = prevEvents.findIndex(e => e.id === eventData.id);
      const newEvent = {
        id: eventData.id,
        title: eventData.title,
        start: eventData.start,
        end: eventData.end,
        allDay: eventData.allDay,
        backgroundColor: '#374151', // Gris oscuro para eventos personalizados
        borderColor: '#111827',
        textColor: '#f9fafb',
        extendedProps: { type: 'custom', custom: true }
      };

      let updatedEvents;
      if (existingEventIndex > -1) {
        updatedEvents = [...prevEvents];
        updatedEvents[existingEventIndex] = newEvent;
      } else {
        updatedEvents = [...prevEvents, newEvent];
      }
      safeSetLocalStorage('loemi-custom-events', updatedEvents.filter(e => e.extendedProps.custom));
      return updatedEvents;
    });
    setShowEventEditModal(false);
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setLocalSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSectionChange = (id: string, field: keyof SectionConfig, value: any) => {
    setLocalSections(prev => prev.map(section => {
      if (section.id === id) {
        return { ...section, [field]: value };
      }
      return section;
    }));
  };

  const handleSectionToggle = (id: string) => {
    const section = localSections.find(s => s.id === id);
    if (section) {
      handleSectionChange(id, 'enabled', !section.enabled);
    }
  };

  const addSection = () => {
    const name = prompt('Nombre para la nueva sección (ej: "Ofertas de Verano"):');
    if (name) {
      const newSection: SectionConfig = {
        id: `custom-${Date.now()}`,
        name: name,
        title: name,
        enabled: true,
        editableTitle: true,
        bgClass: 'bg-white',
        content: [], // Array de bloques de contenido
      };
      setLocalSections(prev => [...prev, newSection]);
    }
  };

  const handleAddBlock = (sectionId: string, type: ContentBlock['type']) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        const newBlock: ContentBlock = { id: `block-${Date.now()}`, type, value: '' };
        return { ...s, content: [...(s.content || []), newBlock] };
      }
      return s;
    }));
  };

  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, content: s.content?.filter(b => b.id !== blockId) };
      }
      return s;
    }));
  };

  const handleBlockChange = (sectionId: string, blockId: string, value: any) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          content: s.content?.map(b => b.id === blockId ? { ...b, value } : b)
        };
      }
      return s;
    }));
  };

  const handleBlockMove = (sectionId: string, oldIndex: number, newIndex: number) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === sectionId && s.content) {
        return { ...s, content: arrayMove(s.content, oldIndex, newIndex) };
      }
      return s;
    }));
  };

  const handleSaveChanges = () => {
    safeSetLocalStorage('loemi-sections', localSections);
    onSectionsUpdate(localSections);
    setInitialSections(JSON.parse(JSON.stringify(localSections))); // Update baseline
    alert('¡Cambios guardados!');
  };

  const handleDiscardChanges = () => {
    if (window.confirm('¿Descartar todos los cambios no guardados?')) {
      setLocalSections(JSON.parse(JSON.stringify(initialSections))); // Reset from baseline
    }
  };

  const openPromotionModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setPromotionForm({
        productId: String(promotion.productId),
        type: promotion.type || 'discount',
        discountPercentage: promotion.discountPercentage?.toString() || '',
        newPrice: promotion.newPrice?.toString() || '',
        startDate: promotion.startDate,
        endDate: promotion.endDate,
      });
    } else {
      setEditingPromotion(null);
      setPromotionForm({
        productId: '',
        type: 'discount',
        discountPercentage: '',
        newPrice: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    }
    setShowPromotionModal(true);
  };

  const handlePromotionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromotionForm(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'discountPercentage' && value) {
        newState.newPrice = '';
      } else if (name === 'newPrice' && value) {
        newState.discountPercentage = '';
      }
      return newState;
    });
  };

  const savePromotion = () => {
    if (!promotionForm.productId || (promotionForm.type === 'discount' && !promotionForm.discountPercentage && !promotionForm.newPrice)) {
      alert('Por favor, selecciona un producto y define un descuento o un nuevo precio para la promoción de tipo "descuento".');
      return;
    }

    const product = products.find(p => p.id === parseInt(promotionForm.productId));
    if (!product) return;

    const newPromotion: Promotion = {
      id: editingPromotion?.id || `promo-${Date.now()}`,
      productId: parseInt(promotionForm.productId),
      type: promotionForm.type,
      productName: product.name,
      discountPercentage: promotionForm.discountPercentage ? parseFloat(promotionForm.discountPercentage) : undefined,
      newPrice: promotionForm.newPrice ? parseFloat(promotionForm.newPrice) : undefined,
      startDate: promotionForm.startDate,
      endDate: promotionForm.endDate,
    };

    let newPromotions;
    if (editingPromotion) {
      newPromotions = promotions.map(p => p.id === editingPromotion.id ? newPromotion : p);
    } else {
      newPromotions = [...promotions, newPromotion];
    }
    savePromotions(newPromotions);
    setShowPromotionModal(false);
  };

  const deletePromotion = (promotionId: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta promoción?')) {
      const newPromotions = promotions.filter(p => p.id !== promotionId);
      savePromotions(newPromotions);
    }
  };

  const renderPromotions = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Promociones</h2>
        <button
          onClick={() => openPromotionModal()}
          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
        >
          Crear Promoción
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left text-stone-700">
          <thead className="text-xs text-stone-800 uppercase bg-stone-200/60">
            <tr>
              <th scope="col" className="px-6 py-3">Producto</th>
              <th scope="col" className="px-6 py-3">Descuento</th>
              <th scope="col" className="px-6 py-3">Periodo</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map(promo => (
              <tr key={promo.id} className="bg-white border-b hover:bg-stone-50">
                <td className="px-6 py-4 font-medium">{promo.productName}</td>
                <td className="px-6 py-4">
                  {promo.type === '2x1' 
                    ? <span className="font-bold text-green-600">2x1</span>
                    : promo.discountPercentage 
                      ? `${promo.discountPercentage}%` 
                      : `${promo.newPrice?.toFixed(2)}€`}
                </td>
                <td className="px-6 py-4">{promo.startDate} - {promo.endDate || 'Indefinido'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-4 justify-end">
                    <button onClick={() => openPromotionModal(promo)} className="font-medium text-amber-700 hover:underline">Editar</button>
                    <button onClick={() => deletePromotion(promo.id)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promotions.length === 0 && (
          <div className="p-6 text-center text-gray-600">
            No hay promociones activas.
          </div>
        )}
      </div>
    </div>
  );

  const createOrderWithProduction = () => {
    if (!orderForm.customerName || !orderForm.customerPhone || orderForm.items.length === 0) {
      alert('Completa todos los campos');
      return;
    }

    const newEvents = [];
    const orderId = `ORD-${Date.now()}`;
    const deliveryDate = new Date(orderForm.deliveryDate);

    orderForm.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.productionTimeDays) {
        const productionStartDate = new Date(deliveryDate);
        productionStartDate.setDate(deliveryDate.getDate() - product.productionTimeDays);
        
        const productionEvent = {
          title: `🧑‍🍳 Inicio: ${product.name}`,
          start: productionStartDate.toISOString().split('T')[0],
          backgroundColor: '#fde68a', // Amarillo
          borderColor: '#facc15',
          textColor: '#a16207',
          id: `production-${orderId}`,
          extendedProps: { type: 'production', orderId: orderId, custom: false }
        };
        newEvents.push(productionEvent);
      }
    });

    // Simulación de falta de stock
    if (inventoryData.some(inv => inv.quantity < inv.minThreshold)) {
      const receptionDate = new Date(deliveryDate);
      receptionDate.setDate(deliveryDate.getDate() - 5); // Pedir 5 días antes
      const receptionEvent = {
        title: '📦 Pedir Harina y Mantequilla',
        start: receptionDate.toISOString().split('T')[0],
        backgroundColor: '#bfdbfe', // Azul
        borderColor: '#60a5fa',
        textColor: '#1d4ed8',
        id: `reception-${Date.now()}`,
        extendedProps: { type: 'reception', custom: false }
      };
      newEvents.push(receptionEvent);
    }

    setCalendarEvents(prev => [...prev, ...newEvents]);
    createOrder(); // Creates the delivery event and saves the order
  };

  const markConsultationAsRead = (id: number) => {
    const updatedConsultations = consultations.map(c => c.id === id ? { ...c, read: true } : c);
    safeSetLocalStorage('loemi-consultations', updatedConsultations);
    setConsultations(updatedConsultations);
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

  const handleDatesSet = (arg: any) => {
    const { start, end } = arg;
    const ordersThisWeek = orders.filter(o => {
      const orderDate = new Date(o.date);
      return orderDate >= start && orderDate < end;
    }).length;

    const productionsToday = calendarEvents.filter(e => 
      e.extendedProps.type === 'production' && new Date(e.start).toDateString() === new Date().toDateString()
    ).length;

    setWeeklySummary(prev => ({
      ...prev,
      orders: ordersThisWeek,
      productions: productionsToday,
      lowStock: 3, // Placeholder
      nextCampaign: 'Halloween' // Placeholder
    }));
  };

  const renderCalendar = () => (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Calendario Operativo</h2>
      <div className="flex justify-between mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-900">
        <div>🧁 Pedidos esta semana: <strong>{weeklySummary.orders}</strong></div>
        <div>👩‍🍳 Producciones hoy: <strong>{weeklySummary.productions}</strong></div>
        <div>🥚 Ingredientes bajos: <strong>{weeklySummary.lowStock}</strong></div>
        <div>🎉 Próxima campaña: <strong>{weeklySummary.nextCampaign}</strong></div>
      </div>
      <div className="flex-grow bg-white p-4 rounded-lg shadow-md min-h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          editable={true}
          selectable={true}
          locale={esLocale}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          eventDidMount={(info) => {
            tippy(info.el, {
              content: `<strong>${info.event.title}</strong><br>${new Date(info.event.startStr).toLocaleDateString('es-ES')}`,
              allowHTML: true,
            });
          }}
          eventClick={handleEventClick}
          datesSet={handleDatesSet} //
          select={handleSelectDate}
          eventContent={(arg) => <div className="p-1 text-xs overflow-hidden whitespace-nowrap text-ellipsis">{arg.event.title}</div>}
        />
      </div>
    </div>
  );

  const renderSections = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-2">Diseño de la Web</h2>
    <p className="text-stone-600 mb-6">
      Arrastra las secciones para reordenarlas, edita sus títulos, y activa o desactiva su visibilidad.
    </p>
    <div className="sticky top-0 bg-gray-100/80 backdrop-blur-sm py-3 z-10 flex justify-end gap-3 mb-4">
      <button
        onClick={handleDiscardChanges}
        className="px-4 py-2 bg-stone-500 text-white font-semibold rounded-lg shadow-sm hover:bg-stone-600"
      >
        Descartar Cambios
      </button>
      <button
        onClick={handleSaveChanges}
        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700"
      >
        Guardar Cambios
      </button>
    </div>

    <div className="mb-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Añadir Nueva Categoría</h3>
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

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Categorías Actuales</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between p-3 border rounded-lg bg-white"
            >
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

    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Secciones de la Página</h3>
      <div className="mb-4">
        <button
          onClick={addSection}
          className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700"
        >
          + Añadir Sección Personalizada
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {localSections.map((section) => (
              <div key={section.id}>
                <SortableSectionItem
                  section={section}
                  products={products}
                  onToggle={handleSectionToggle}
                  onChange={handleSectionChange}
                  onDelete={(id) => { if (window.confirm('¿Seguro que quieres eliminar esta sección?')) setLocalSections(prev => prev.filter(s => s.id !== id)); }}
                  onAddBlock={handleAddBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onBlockChange={handleBlockChange}
                  onBlockMove={handleBlockMove}
                  sensors={sensors}
                />
                {section.id.startsWith('custom-') && (
                  <div className="w-full pl-10 mt-4 space-y-3">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => { const { active, over } = e; if (active && over && active.id !== over.id) { const oldIndex = section.content?.findIndex(b => b.id === active.id) ?? -1; const newIndex = section.content?.findIndex(b => b.id === over.id) ?? -1; if (oldIndex !== -1 && newIndex !== -1) handleBlockMove(section.id, oldIndex, newIndex); } }}>
                      <SortableContext items={section.content?.map(b => b.id) || []} strategy={verticalListSortingStrategy}>
                        {section.content?.map(block => (
                          <SortableBlockItem key={block.id} block={block} products={products} onChange={(content) => handleBlockChange(section.id, block.id, content)} onDelete={() => handleDeleteBlock(section.id, block.id)} />
                        ))}
                      </SortableContext>
                    </DndContext>
                    <div className="flex gap-2 pt-2 border-t">
                      <button onClick={() => handleAddBlock(section.id, 'text')} className="text-xs px-2 py-1 bg-stone-200 rounded hover:bg-stone-300">+ Texto</button>
                      <button onClick={() => handleAddBlock(section.id, 'product')} className="text-xs px-2 py-1 bg-stone-200 rounded hover:bg-stone-300">+ Producto</button>
                      <button onClick={() => handleAddBlock(section.id, 'image')} className="text-xs px-2 py-1 bg-stone-200 rounded hover:bg-stone-300">+ Imagen</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  </div>
  );

  const renderConsultations = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Bandeja de Entrada de Consultas</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {consultations.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No hay consultas disponibles.
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {consultations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((consultation) => (
              <div key={consultation.id} className={`p-4 border rounded-lg ${consultation.read ? 'bg-gray-50' : 'bg-amber-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-stone-800">{consultation.name} <span className="text-sm text-stone-500">&lt;{consultation.email}&gt;</span></p>
                    <p className="text-xs text-stone-500">{new Date(consultation.timestamp).toLocaleString('es-ES')}</p>
                  </div>
                  {!consultation.read && (
                    <button
                      onClick={() => markConsultationAsRead(consultation.id)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Marcar como leído
                    </button>
                  )}
                </div>
                <p className="mt-3 text-stone-700 whitespace-pre-wrap">{consultation.message}</p>
              </div>
            ))}
          </div>
        )}
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
          <table className="w-full text-sm text-left text-stone-700">
            <thead className="text-xs text-stone-800 uppercase bg-stone-200/60">
              <tr>
                <th scope="col" className="px-6 py-3 w-20">Imagen</th>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Precio</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="bg-white border-b hover:bg-stone-50">
                  <td className="px-6 py-4">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">{product.name}</th>
                  <td className="px-6 py-4">{product.price}€</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-4 justify-end">
                      <button
                        onClick={() => openProductModal(product)}
                        className="font-medium text-amber-700 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="font-medium text-red-600 hover:underline"
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
              activeSection === 'orders' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('orders')}
          >
            📋 Pedidos
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'calendar' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('calendar')}
          >
            📅 Calendario
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'sections' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('sections')}
          >
            🎨 Diseño Web
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'consultations' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('consultations')}
          >
            ✉️ Mensajes <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">{consultations.filter(c => !c.read).length}</span>
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded ${
              activeSection === 'promotions' ? 'bg-amber-200 text-amber-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveSection('promotions')}
          >
            💸 Promociones
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
        {activeSection === 'orders' && renderOrders()}
        {activeSection === 'calendar' && renderCalendar()}
        {activeSection === 'sections' && renderSections()}
        {activeSection === 'consultations' && renderConsultations()}
        {activeSection === 'promotions' && renderPromotions()}
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
              <textarea
                placeholder="Ingredientes (separados por comas)"
                value={productForm.ingredients}
                onChange={(e) => setProductForm({...productForm, ingredients: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={2}
              />
              <textarea
                placeholder="Alérgenos (separados por comas)"
                value={productForm.allergens}
                onChange={(e) => setProductForm({...productForm, allergens: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={2}
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

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingPromotion ? 'Editar Promoción' : 'Crear Promoción'}</h3>
            <div className="space-y-4">
              <select
                name="productId"
                value={promotionForm.productId}
                onChange={handlePromotionFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecciona un producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select
                name="type"
                value={promotionForm.type}
                onChange={handlePromotionFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="discount">Descuento</option>
                <option value="2x1">2x1</option>
              </select>
              {promotionForm.type === 'discount' && (
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    name="discountPercentage"
                    placeholder="% de descuento"
                    value={promotionForm.discountPercentage}
                    onChange={handlePromotionFormChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-stone-500">o</span>
                  <input
                    type="number"
                    name="newPrice"
                    step="0.01"
                    placeholder="Nuevo precio (€)"
                    value={promotionForm.newPrice}
                    onChange={handlePromotionFormChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={promotionForm.startDate}
                  onChange={handlePromotionFormChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="date"
                  name="endDate"
                  value={promotionForm.endDate}
                  onChange={handlePromotionFormChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={savePromotion} className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900">Guardar</button>
              <button onClick={() => setShowPromotionModal(false)} className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
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
              <input
                type="date"
                placeholder="Fecha de entrega"
                value={orderForm.deliveryDate}
                onChange={(e) => setOrderForm({...orderForm, deliveryDate: e.target.value})}
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
                onClick={createOrderWithProduction}
                disabled={orderForm.items.length === 0}
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Crear Pedido
              </button>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setOrderForm({ customerName: '', customerPhone: '', customerEmail: '', deliveryDate: new Date().toISOString().split('T')[0], items: [] });
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Event Edit/Create Modal */}
      {showEventEditModal && (
        <EventEditModal
          eventInfo={editingEventInfo}
          onClose={() => setShowEventEditModal(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};

const ALLERGENS_LIST = [
  'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 
  'Soja', 'Leche', 'Frutos de cáscara', 'Apio', 'Mostaza', 
  'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
];

export default AdminDashboard;