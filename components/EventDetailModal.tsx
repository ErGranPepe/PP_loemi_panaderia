import React from 'react';
import { Order, Consultation } from '../types';

interface EventDetailModalProps {
  event: any; // FullCalendar Event API
  onClose: () => void;
  onEdit: (event: any) => void;
  onDelete: (event: any) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onEdit, onDelete }) => {

  const { title, start, end, extendedProps } = event;
  const { type, data } = extendedProps;

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  const renderContent = () => {
    switch (type) {
      case 'order':
        const order = data as Order;
        return (
          <div className="space-y-3">
            <p><strong>Cliente:</strong> {order.customer.name}</p>
            <p><strong>Teléfono:</strong> {order.customer.phone}</p>
            <p><strong>Total:</strong> {order.total.toFixed(2)}€</p>
            <div>
              <strong>Productos:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                {order.items.map((item, index) => (
                  <li key={index}>{item.name} x{item.quantity}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'consultation':
        const consultation = data as Consultation;
        return (
          <div className="space-y-3">
            <p><strong>De:</strong> {consultation.name} ({consultation.email})</p>
            <p className="whitespace-pre-wrap bg-stone-100 p-2 rounded"><strong>Mensaje:</strong> {consultation.message}</p>
          </div>
        );
      case 'production':
      case 'reception':
      case 'campaign':
        return <p>Evento programado. Más detalles próximamente.</p>;
      case 'holiday':
        return <p>Día festivo. La tienda podría estar cerrada.</p>;
      default:
        return <p>No hay detalles adicionales para este evento.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold font-serif text-stone-800">{title}</h2>
            <button onClick={onClose} className="p-2 -mr-2 -mt-2 rounded-full hover:bg-stone-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="text-sm text-stone-600 mb-4 border-b pb-4">
            <p><strong>Inicio:</strong> {formatDate(start)}</p>
            {end && <p><strong>Fin:</strong> {formatDate(end)}</p>}
          </div>

          <div className="text-stone-700">
            {renderContent()}
          </div>
        </div>

        <div className="bg-stone-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={() => onDelete(event)}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700"
          >
            Eliminar
          </button>
          <button
            onClick={() => onEdit(event)}
            className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-sm hover:bg-amber-900"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;