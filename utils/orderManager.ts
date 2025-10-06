import { Order, ChatOrder } from '../types';

export class OrderManager {
  private static instance: OrderManager;
  private orders: Order[] = [];

  private constructor() {
    this.loadOrders();
  }

  static getInstance(): OrderManager {
    if (!OrderManager.instance) {
      OrderManager.instance = new OrderManager();
    }
    return OrderManager.instance;
  }

  private loadOrders() {
    const stored = localStorage.getItem('loemi-orders');
    if (stored) {
      this.orders = JSON.parse(stored);
    }
  }

  private saveOrders() {
    localStorage.setItem('loemi-orders', JSON.stringify(this.orders));
  }

  addOrder(order: Order) {
    this.orders.push(order);
    this.saveOrders();
    this.sendEmailNotification(order);
    return order;
  }

  getOrders(): Order[] {
    return this.orders;
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrders();
    }
  }

  createOrderFromChat(chatOrder: ChatOrder): Order {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      customer: {
        name: chatOrder.customerInfo.name || 'Cliente Chat',
        email: chatOrder.customerInfo.email || '',
        phone: chatOrder.customerInfo.phone || ''
      },
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      total: chatOrder.total,
      items: chatOrder.items.map(item => ({
        name: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      source: 'chat'
    };
    
    this.addOrder(order);
    return order;
  }

  private async sendEmailNotification(order: Order) {
    // Simulación de envío de email
    console.log('📧 Enviando notificación de nuevo pedido:', {
      to: 'admin@loemiartesanos.com',
      subject: `Nuevo pedido: ${order.id}`,
      body: `
        Nuevo pedido recibido:
        
        ID: ${order.id}
        Cliente: ${order.customer.name}
        Teléfono: ${order.customer.phone}
        Email: ${order.customer.email}
        Total: ${order.total.toFixed(2)}€
        Origen: ${order.source}
        
        Productos:
        ${order.items.map(item => `- ${item.name} x${item.quantity} (${item.price.toFixed(2)}€)`).join('\n')}
      `
    });
    
    // Mostrar notificación visual
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('newOrder', { detail: order });
      window.dispatchEvent(event);
    }
  }
}