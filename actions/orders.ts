'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getSessionId} from '@/utils/cookies';
import {CartItem, DeliveryFormData} from '@/lib/validators';
import {db} from '@/drizzle/index';
import {ordersTable, orderItemsTable} from '@/drizzle/db/schema';
import {eq, desc, inArray} from 'drizzle-orm';

import {PaymentInfo} from '@/lib/types/query-types';

/* ------------------------------------------------- */
export async function createOrder(
  cartItems: CartItem[],
  deliveryInfo: DeliveryFormData,
  paymentInfo: PaymentInfo
) {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Calculate total amount (ensure we're working with numbers)
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Create order
    const newOrder = {
      user_id: user?.id,
      session_id: user ? null : await getSessionId(),
      status: 'pending',
      total_amount: totalAmount.toFixed(2),
      delivery_info: deliveryInfo,
      payment_info: paymentInfo.method,
    };

    const order = await db.insert(ordersTable).values(newOrder).returning();

    if (!order[0]) throw new Error('Failed to create order');

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order[0].id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: Number(item.price).toFixed(2),
      name: item.name,
      size: item.size,
      color: item.color,
      slug: item.slug,
      image: item.images[0],
    }));

    await db.insert(orderItemsTable).values(orderItems);

    // Clear cart using the cart function


    return {success: true, orderId: order[0].id};
  } catch (error) {
    console.error('Error creating order:', error);
    return {success: false, error: 'Failed to create order'};
  }
}
/* ------------------------------------------------- */
export async function getOrder(orderId: string) {
  try {
    // Get the order first
    const orderResult = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      return {success: false, error: 'Order not found'};
    }

    const order = orderResult[0];

    // Get order items separately
    const orderItems = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, orderId));

    // Combine order with items
    const orderWithItems = {
      ...order,
      order_items: orderItems,
    };

    return {success: true, order: orderWithItems};
  } catch (error) {
    console.error('Error fetching order:', error);
    return {success: false, error: 'Failed to fetch order'};
  }
}

/* ------------------------------------------------- */
export async function getUserOrders() {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
      console.error(
        'Authentication error fetching user orders: User not authenticated'
      );
      // If not logged in, return empty array or handle as needed
      return {success: false, error: 'User not authenticated', orders: []};
    }

    // Get all user orders
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.user_id, user.id))
      .orderBy(desc(ordersTable.created_at));

    // Get all order items for user's orders
    const orderIds = orders.map((order) => order.id);
    const allOrderItems = await db
      .select()
      .from(orderItemsTable)
      .where(inArray(orderItemsTable.order_id, orderIds));

    // Group order items by order
    const ordersWithItems = orders.map((order) => ({
      ...order,
      order_items: allOrderItems.filter((item) => item.order_id === order.id),
    }));

    return {success: true, orders: ordersWithItems};
  } catch (error) {
    console.error('Unexpected error in getUserOrders:', error);
    return {success: false, error: 'Unexpected error', orders: []};
  }
}
