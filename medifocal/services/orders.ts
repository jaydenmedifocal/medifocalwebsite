import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartItem } from '../contexts/CartContext';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  nextDeliveryDate?: Date | Timestamp;
}

/**
 * Get all orders for a user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        orderNumber: data.orderNumber || `ORD-${doc.id.substring(0, 8).toUpperCase()}`,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        shipping: data.shipping || 0,
        tax: data.tax || 0,
        total: data.total || 0,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'pending',
        shippingAddress: data.shippingAddress,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        stripeSessionId: data.stripeSessionId,
        stripePaymentIntentId: data.stripePaymentIntentId,
        isRecurring: data.isRecurring || false,
        recurringFrequency: data.recurringFrequency,
        nextDeliveryDate: data.nextDeliveryDate?.toDate ? data.nextDeliveryDate.toDate() : data.nextDeliveryDate ? new Date(data.nextDeliveryDate) : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

/**
 * Get a single order by ID
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return null;
    }
    
    const data = orderSnap.data();
    return {
      id: orderSnap.id,
      userId: data.userId,
      orderNumber: data.orderNumber || `ORD-${orderSnap.id.substring(0, 8).toUpperCase()}`,
      items: data.items || [],
      subtotal: data.subtotal || 0,
      shipping: data.shipping || 0,
      tax: data.tax || 0,
      total: data.total || 0,
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus || 'pending',
      shippingAddress: data.shippingAddress,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      stripeSessionId: data.stripeSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency,
      nextDeliveryDate: data.nextDeliveryDate?.toDate ? data.nextDeliveryDate.toDate() : data.nextDeliveryDate ? new Date(data.nextDeliveryDate) : undefined,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

/**
 * Create a recurring order from an existing order
 */
export const createRecurringOrder = async (
  orderId: string,
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
): Promise<string> => {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Calculate next delivery date based on frequency
    const nextDelivery = new Date();
    switch (frequency) {
      case 'weekly':
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case 'biweekly':
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case 'monthly':
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
      case 'quarterly':
        nextDelivery.setMonth(nextDelivery.getMonth() + 3);
        break;
    }
    
    // Update the order to be recurring
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      isRecurring: true,
      recurringFrequency: frequency,
      nextDeliveryDate: Timestamp.fromDate(nextDelivery),
      updatedAt: Timestamp.now(),
    });
    
    return orderId;
  } catch (error) {
    console.error('Error creating recurring order:', error);
    throw error;
  }
};

/**
 * Cancel a recurring order
 */
export const cancelRecurringOrder = async (orderId: string): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      isRecurring: false,
      recurringFrequency: null,
      nextDeliveryDate: null,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error cancelling recurring order:', error);
    throw error;
  }
};







