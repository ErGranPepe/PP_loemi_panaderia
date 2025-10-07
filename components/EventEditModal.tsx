import React, { useState } from 'react';

interface EventEditModalProps {
  eventInfo: any; // Can be a FullCalendar event or a date selection
  onClose: () => void;
  onSave: (eventData: { id: string, title: string, start: string, end: string, allDay: boolean }) => void;
}

const EventEditModal: React.FC<EventEditModalProps> = ({ eventInfo, onClose, onSave }) => {
  const isNew = !eventInfo.event;
  const [title, setTitle] = useState(isNew ? '' : eventInfo.event.title);
  const [allDay, setAllDay] = useState(isNew ? eventInfo.allDay : eventInfo.event.allDay);

  // FullCalendar's end date is exclusive for all-day events. We adjust it to be inclusive for the UI.
  const getInclusiveEnd = (endStr: string, allDay: boolean) => {
    if (endStr && allDay) {
      const date = new Date(endStr);
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    }
    return endStr || '';
  };

  const [start, setStart] = useState(isNew ? eventInfo.startStr : eventInfo.event.startStr);
  const [end, setEnd] = useState(isNew ? getInclusiveEnd(eventInfo.endStr, allDay) : getInclusiveEnd(eventInfo.event.endStr, allDay));

  const handleSave = () => {
    if (!title) {
      alert('El título es obligatorio.');
      return;
    }
    onSave({
      id: isNew ? `custom-${Date.now()}` : eventInfo.event.id, // Use existing ID if editing
      title,
      start,
      end: allDay && end ? new Date(new Date(end).getTime() + 86400000).toISOString().split('T')[0] : end, // Make end exclusive for FC
      allDay,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold font-serif text-stone-800">{isNew ? 'Crear Evento' : 'Editar Evento'}</h2>
            <button onClick={onClose} className="p-2 -mr-2 -mt-2 rounded-full hover:bg-stone-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-stone-700">Título</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-stone-700">Inicio</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                id="start"
                value={allDay ? start.split('T')[0] : start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-stone-700">Fin</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                id="end"
                value={end ? (allDay ? end.split('T')[0] : end) : ''}
                onChange={(e) => setEnd(e.target.value)}
                min={allDay ? start.split('T')[0] : start}
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center">
              <input id="allDay" name="allDay" type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500" />
              <label htmlFor="allDay" className="ml-2 block text-sm text-stone-900">Todo el día</label>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 bg-stone-200 text-stone-800 font-semibold rounded-lg hover:bg-stone-300">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-sm hover:bg-amber-900">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EventEditModal;