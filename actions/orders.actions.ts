'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getSessionId} from '@/utils/cookies';
import {CartItemWithProduct} from '@/lib/types/db';
import {DeliveryFormData, deliverySchema} from '@/lib/validators';
import {db} from '@/drizzle/index';
import {ordersTable, orderItemsTable} from '@/drizzle/db/schema';
import {eq, desc /* inArray */} from 'drizzle-orm';
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

// drizzle relations join query
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

// drizzle med egen join query
/* export async function getUserOrderById(orderId: string) {
  try {
    // INNER JOIN query för att få order med dess items
    const orderWithItems = await db
      .select({
        // Order fält
        orderId: ordersTable.id,
        orderUserId: ordersTable.user_id,
        orderSessionId: ordersTable.session_id,
        orderTotalAmount: ordersTable.total_amount,
        orderPaymentInfo: ordersTable.payment_info,
        orderStatus: ordersTable.status,
        orderDeliveryInfo: ordersTable.delivery_info,
        orderCreatedAt: ordersTable.created_at,
        orderUpdatedAt: ordersTable.updated_at,

        // Order items fält
        itemId: orderItemsTable.id,
        itemOrderId: orderItemsTable.order_id,
        itemProductId: orderItemsTable.product_id,
        itemQuantity: orderItemsTable.quantity,
        itemPrice: orderItemsTable.price,
        itemName: orderItemsTable.name,
        itemSize: orderItemsTable.size,
        itemColor: orderItemsTable.color,
        itemSlug: orderItemsTable.slug,
        itemCreatedAt: orderItemsTable.created_at,
        itemImage: orderItemsTable.image,
      })
      .from(ordersTable)
      .innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.order_id))
      .where(eq(ordersTable.id, orderId));


    if (orderWithItems.length === 0) {
      return {success: false, error: 'Order not found'};
    }

    // Bygg order-objektet från första raden (alla rader har samma order-data)
    const firstRow = orderWithItems[0];
    const order = {
      id: firstRow.orderId,
      user_id: firstRow.orderUserId,
      session_id: firstRow.orderSessionId,
      total_amount: firstRow.orderTotalAmount,
      payment_info: firstRow.orderPaymentInfo,
      status: firstRow.orderStatus,
      delivery_info: firstRow.orderDeliveryInfo,
      created_at: firstRow.orderCreatedAt,
      updated_at: firstRow.orderUpdatedAt,

      // Bygg items-arrayen från alla rader
      order_items: orderWithItems.map((row) => ({
        id: row.itemId,
        order_id: row.itemOrderId,
        product_id: row.itemProductId,
        quantity: row.itemQuantity,
        price: row.itemPrice,
        name: row.itemName,
        size: row.itemSize,
        color: row.itemColor,
        slug: row.itemSlug,
        created_at: row.itemCreatedAt,
        image: row.itemImage,
      })),
    };

    return {success: true, order};
  } catch (error) {
    console.error('Error fetching order:', error);
    return {success: false, error: 'Failed to fetch order'};
  }
} */

// getUserOrdersOverview UTAN join
/* 
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
} */

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

    const ordersWithItems = await db
      .select({
        orderId: ordersTable.id,
        orderCreatedAt: ordersTable.created_at,

        itemOrderId: orderItemsTable.order_id,
        itemImage: orderItemsTable.image,
        itemName: orderItemsTable.name,
      })
      .from(ordersTable)
      .innerJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.order_id))
      .where(eq(ordersTable.user_id, user.id))
      .orderBy(desc(ordersTable.created_at));

    const orderMap = new Map<
      string,
      {
        id: string;
        created_at: Date;
        order_items: Array<{
          order_id: string;
          image: string | null;
          name: string;
        }>;
      }
    >();

    ordersWithItems.forEach((row) => {
      const orderId = row.orderId;

      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: row.orderId,
          created_at: row?.orderCreatedAt || new Date(),
          order_items: [],
        });
      }

      orderMap.get(orderId)!.order_items.push({
        order_id: row.itemOrderId,
        image: row.itemImage,
        name: row.itemName,
      });
    });

    const orders = Array.from(orderMap.values());

    return {success: true, orders};
  } catch (error) {
    console.error('Unexpected error in getUserOrdersOverview:', error);
    return {success: false, error: 'Unexpected error', orders: []};
  }
}
