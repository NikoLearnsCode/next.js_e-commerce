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

  try {
    // Create order
    const orderId = await db.transaction(async (tx) => {
      const now = new Date();
      const newOrder = {
        user_id: user?.id,
        session_id: user ? null : await getSessionId(),
        status: 'betald',
        total_amount: totalPrice.toString(),
        delivery_info: deliveryInfo,
        payment_info: paymentInfo.method,
        created_at: now,
        updated_at: now,
      };

      const [newlyCreatedOrder] = await tx
        .insert(ordersTable)
        .values(newOrder)
        .returning();

      if (!newlyCreatedOrder) throw new Error('Failed to create order');

      const orderItems = cartItems.map((item) => ({
        order_id: newlyCreatedOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        size: item.size,
        color: item.color,
        slug: item.slug,
        image: item.images[0],
        created_at: now,
      }));

      await tx.insert(orderItemsTable).values(orderItems);
      // Om koden når hit utan fel, kommer Drizzle automatiskt att 'COMMIT'
      // och returnera värdet nedan.
      return newlyCreatedOrder.id;
    });
    console.log('Order created:', orderId);
    return {success: true, orderId: orderId};
  } catch (error) {
    console.error('Error creating order:', error);
    return {success: false, error: 'Failed to create order'};
  }
}

// NIVÅ 1: DRIZZLE-RELATIONER query
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

// NIVÅ 3: Raw postgresql query pseudo
/* export async function getUserOrderById(orderId: string) 

    const orderQueryText = 'SELECT * FROM "orders" WHERE "id" = $1 LIMIT 1';
    const orderResult = await pool.query(orderQueryText, [orderId]);
    const orderData = orderResult.rows[0];


    const itemsQueryText = 'SELECT * FROM "order_items" WHERE "order_id" = $1';
    const itemsResult = await pool.query(itemsQueryText, [orderId]);
    const orderItems = itemsResult.rows;

    const combinedOrder = {
      ...orderData,
      order_items: orderItems,
    };

    return {success: true, order: combinedOrder};
 */

//Nivå 2. Drizzle sql query
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

//Nivå 3. Raw postgresql query pseudo
/* 
export async function getUserOrdersOverview() 

    const session = await getServerSession(authOptions);
    const user = session?.user;

    const ordersQueryText =
      'SELECT "id", "created_at" FROM "orders" WHERE "user_id" = $1 ORDER BY "created_at" DESC';
    const ordersResult = await pool.query(ordersQueryText, [user.id]);
    const orders = ordersResult.rows;


    const orderIds = orders.map((order) => order.id);
    const placeholders = orderIds.map((_, index) => `$${index + 1}`).join(', ');
    const itemsQueryText = `SELECT "order_id", "image", "name" FROM "order_items" WHERE "order_id" IN (${placeholders})`;


    const itemsResult = await pool.query(itemsQueryText, orderIds);
    const orderItems = itemsResult.rows;

    const ordersWithItems = orders.map((order) => ({
      ...order,
      order_items: orderItems.filter((item) => item.order_id === order.id),
    }));

    return {success: true, orders: ordersWithItems};
 */
