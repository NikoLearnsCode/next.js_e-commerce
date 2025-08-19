'use server';

import {createClient} from '@/utils/supabase/server';
import {getSessionId} from '@/utils/cookies';
import {CartItem, DeliveryFormData} from '@/lib/validators';

interface PaymentInfo {
  method: 'card' | 'swish' | 'klarna';
}

export async function createOrder(
  cartItems: CartItem[],
  deliveryInfo: DeliveryFormData,
  paymentInfo: PaymentInfo
) {
  try {
    const supabase = await createClient();

    // Check if user is logged in
    const {
      data: {user},
    } = await supabase.auth.getUser();

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const {data: order, error: orderError} = await supabase
      .from('orders')
      .insert({
        user_id: user?.id,
        session_id: user ? null : await getSessionId(),
        status: 'pending',
        total_amount: totalAmount,
        delivery_info: deliveryInfo,
        payment_info: paymentInfo,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      size: item.size,
      color: item.color,
      image: item.images[0],
    }));

    const {error: itemsError} = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart
    if (user) {
      await supabase.from('carts').delete().eq('user_id', user.id);
    } else {
      const sessionId = await getSessionId();
      await supabase.from('carts').delete().eq('session_id', sessionId);
    }

    return {success: true, orderId: order.id};
  } catch (error) {
    console.error('Error creating order:', error);
    return {success: false, error: 'Failed to create order'};
  }
}

export async function getOrder(orderId: string) {
  try {
    const supabase = await createClient();

    const {data: order, error: orderError} = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    return {success: true, order};
  } catch (error) {
    console.error('Error fetching order:', error);
    return {success: false, error: 'Failed to fetch order'};
  }
}

// New Server Action to get orders for the current user
export async function getUserOrders() {
  try {
    const supabase = await createClient();
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error fetching user orders:', authError);
      // If not logged in, return empty array or handle as needed
      return {success: false, error: 'User not authenticated', orders: []};
    }

    // Fetch orders and their related items
    const {data: orders, error: ordersError} = await supabase
      .from('orders')
      .select(
        `
        id, 
        created_at, 
        total_amount, 
        status,
        order_items ( product_id, name, quantity, price, size, image ) 
      `
      )
      .eq('user_id', user.id)
      .order('created_at', {ascending: false}); 

    if (ordersError) {
      console.error('Error fetching user orders:', ordersError);
      return {success: false, error: 'Failed to fetch orders', orders: []};
    }

    return {success: true, orders: orders || []};
  } catch (error) {
    console.error('Unexpected error in getUserOrders:', error);
    return {success: false, error: 'Unexpected error', orders: []};
  }
}
