'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getSessionId} from '@/utils/cookies';
import {CartItemWithProduct} from '@/lib/types/db';
import {DeliveryFormData, deliverySchema} from '@/lib/validators';
import {db} from '@/drizzle/index';
import {ordersTable, orderItemsTable} from '@/drizzle/db/schema';
import {eq, desc, inArray} from 'drizzle-orm';
import {PaymentInfo} from '@/lib/types/query';

export async function createOrder(
  cartItems: CartItemWithProduct[],
  deliveryInfo: DeliveryFormData,
  paymentInfo: PaymentInfo,
  totalPrice: number
) {
  try {
    const deliveryValidation = deliverySchema.safeParse(deliveryInfo);
    if (!deliveryValidation.success) {
      console.error(
        'Delivery validation failed:',
        deliveryValidation.error.flatten()
      );
      return {
        success: false,
        error: 'Leveransinformationen är ogiltig. Kontrollera alla fält.',
      };
    }

    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Create order
    const newOrder = {
      user_id: user?.id,
      session_id: user ? null : await getSessionId(),
      status: 'pending',
      total_amount: totalPrice.toString(),
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
      price: item.price,
      name: item.name,
      size: item.size,
      color: item.color,
      slug: item.slug,
      image: item.images[0],
    }));

    await db.insert(orderItemsTable).values(orderItems);

    return {success: true, orderId: order[0].id};
  } catch (error) {
    console.error('Error creating order:', error);
    return {success: false, error: 'Failed to create order'};
  }
}

export async function getUserOrderById(orderId: string) {
  try {
    const order = await db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, orderId),
      with: {
        order_items: true,
      },
    });

    if (!order) {
      return {success: false, error: 'Order not found'};
    }

    return {success: true, order};
  } catch (error) {
    console.error('Error fetching order:', error);
    return {success: false, error: 'Failed to fetch order'};
  }
}

export async function getUserOrdersOverview() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
      console.error(
        'Authentication error fetching user orders: User not authenticated'
      );
      return {success: false, error: 'User not authenticated', orders: []};
    }

    const orders = await db
      .select({
        id: ordersTable.id,
        created_at: ordersTable.created_at,
      })
      .from(ordersTable)
      .where(eq(ordersTable.user_id, user.id))
      .orderBy(desc(ordersTable.created_at));

    const orderIds = orders.map((order) => order.id);
    const orderItems = await db
      .select({
        order_id: orderItemsTable.order_id,
        image: orderItemsTable.image,
        name: orderItemsTable.name,
      })
      .from(orderItemsTable)
      .where(inArray(orderItemsTable.order_id, orderIds));

    const ordersWithItems = orders.map((order) => ({
      ...order,
      order_items: orderItems.filter((item) => item.order_id === order.id),
    }));

    return {success: true, orders: ordersWithItems};
  } catch (error) {
    console.error('Unexpected error in getUserOrdersSummary:', error);
    return {success: false, error: 'Unexpected error', orders: []};
  }
}
