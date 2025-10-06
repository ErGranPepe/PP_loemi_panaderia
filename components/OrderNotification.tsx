import React, { useState, useEffect } from 'react';
import { OrderManager } from '../utils/orderManager';

const OrderNotification: React.FC = () => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const orderManager = OrderManager.getInstance();
    const orders = orderManager.getOrders();
    
    // Contar pedidos nuevos (últimas 24 horas)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const newOrders = orders.filter(order => 
      new Date(order.date) > yesterday && order.status === 'Pendiente'
    );
    
    if (newOrders.length > newOrderCount) {
      setNewOrderCount(newOrders.length);
      setShowNotification(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [newOrderCount]);

  if (!showNotification || newOrderCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white p-4 rounded-lg shadow-lg animate-bounce">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🔔</span>
        <div>
          <div className="font-bold">¡Nuevo pedido!</div>
          <div className="text-sm">
            {newOrderCount} pedido{newOrderCount > 1 ? 's' : ''} pendiente{newOrderCount > 1 ? 's' : ''}
          </div>
        </div>
        <button 
          onClick={() => setShowNotification(false)}
          className="ml-2 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default OrderNotification;