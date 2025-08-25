'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {
  CART_SESSION_COOKIE,
  getOrCreateSessionId,
  getSessionId,
} from '@/utils/cookies';
import type {CartItem, NewCart} from '@/lib/validators';
import {db} from '@/drizzle/index';
import {cartsTable} from '@/drizzle/db/schema';
import {eq, and, isNull} from 'drizzle-orm';
import {cookies} from 'next/headers';
import Decimal from 'decimal.js';

// Beräknar varukorgens totalpris med Decimal.js för exakthet
function calculateCartTotal(items: CartItem[]): number {
  if (!items || items.length === 0) {
    return 0;
  }
  const total = items.reduce((sum, item) => {
    const itemTotal = new Decimal(item.price).times(item.quantity);
    return sum.plus(itemTotal);
  }, new Decimal(0));
  return total.toNumber();
}

// --------------------------------------------------------
// Beräknar det totala antalet produkter i varukorgen
function calculateItemCount(items: CartItem[]): number {
  if (!items || items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// --------------------------------------------------------
// Central funktion som uppdaterar databasen och returnerar det nya tillståndet
async function updateCartInDbAndReturnState(
  cartId: string,
  updatedItems: CartItem[]
) {
  if (updatedItems.length === 0) {
    await db.delete(cartsTable).where(eq(cartsTable.id, cartId));
    const cookieStore = await cookies();
    cookieStore.delete(CART_SESSION_COOKIE);
    return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
  }
  await db
    .update(cartsTable)
    .set({items: updatedItems, updated_at: new Date()})
    .where(eq(cartsTable.id, cartId));
  const totalPrice = calculateCartTotal(updatedItems);
  const itemCount = calculateItemCount(updatedItems);
  return {success: true, cartItems: updatedItems, totalPrice, itemCount};
}

// --------------------------------------------------------
export async function getCart() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    let cart;
    if (user) {
      const cartData = await db
        .select()
        .from(cartsTable)
        .where(eq(cartsTable.user_id, user.id))
        .limit(1);
      cart = cartData[0] || null;
    } else {
      const sessionId = await getSessionId();
      if (!sessionId) {
        return {cart: null, cartItems: [], totalPrice: 0, itemCount: 0};
      }
      const cartData = await db
        .select()
        .from(cartsTable)
        .where(
          and(eq(cartsTable.session_id, sessionId), isNull(cartsTable.user_id))
        )
        .limit(1);
      cart = cartData[0] || null;
    }

    if (!cart) {
      return {cart: null, cartItems: [], totalPrice: 0, itemCount: 0};
    }
    const cartItems = (cart.items as CartItem[]) || [];
    const totalPrice = calculateCartTotal(cartItems);
    const itemCount = calculateItemCount(cartItems);

    return {cart, cartItems, totalPrice, itemCount};
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {cart: null, cartItems: [], totalPrice: 0, itemCount: 0};
  }
}

// --------------------------------------------------------
export async function addToCart(cartItem: CartItem) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const sessionId = user ? null : await getOrCreateSessionId();
    let {cart} = await getCart();

    if (!cart) {
      const newCart: NewCart = {
        session_id: user ? null : sessionId,
        user_id: user?.id || null,
        items: [],
      };
      const createdCart = await db
        .insert(cartsTable)
        .values(newCart)
        .returning();
      if (!createdCart[0]) throw new Error('Failed to create cart');
      cart = createdCart[0];
    }

    const currentCartItems = (cart.items as CartItem[]) || [];
    const existingItemIndex = currentCartItems.findIndex(
      (item: CartItem) =>
        item.product_id === cartItem.product_id && item.size === cartItem.size
    );

    let updatedCartItems: CartItem[];
    if (existingItemIndex >= 0) {
      updatedCartItems = [...currentCartItems];
      updatedCartItems[existingItemIndex].quantity += cartItem.quantity;
    } else {
      updatedCartItems = [...currentCartItems, cartItem];
    }

    return await updateCartInDbAndReturnState(cart.id, updatedCartItems);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {success: false, error: 'Failed to add item to cart'};
  }
}

// --------------------------------------------------------
export async function removeFromCart(itemId: string) {
  try {
    const {cart} = await getCart();
    if (!cart)
      return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};

    const updatedCartItems = (cart.items as CartItem[]).filter(
      (item: CartItem) => item.id !== itemId
    );

    return await updateCartInDbAndReturnState(cart.id, updatedCartItems);
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {success: false, error: 'Failed to remove item from cart'};
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    const {cart} = await getCart();
    if (!cart) return {success: false, error: 'Cart not found'};

    const currentCartItems = (cart.items as CartItem[]) || [];
    const itemIndex = currentCartItems.findIndex(
      (item: CartItem) => item.id === itemId
    );
    if (itemIndex === -1) {
      return {success: false, error: 'Item not found in cart'};
    }

    const updatedCartItems: CartItem[] = [...currentCartItems];
    updatedCartItems[itemIndex].quantity = quantity;

    return await updateCartInDbAndReturnState(cart.id, updatedCartItems);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return {success: false, error: 'Failed to update item quantity'};
  }
}

// --------------------------------------------------------
export async function clearCart() {
  try {
    const {cart} = await getCart();
    if (!cart)
      return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
    await db.delete(cartsTable).where(eq(cartsTable.id, cart.id));
    return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {success: false, error: 'Failed to clear cart'};
  }
}
// --------------------------------------------------------
export async function transferCartOnLogin(userId: string) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return {success: true, message: 'No session_id found'};
    }
    const sessionCartData = await db
      .select()
      .from(cartsTable)
      .where(
        and(eq(cartsTable.session_id, sessionId), isNull(cartsTable.user_id))
      )
      .limit(1);
    const sessionCart = sessionCartData[0] || null;
    if (!sessionCart) {
      return {success: true, message: 'No session cart found'};
    }
    const userCartData = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.user_id, userId))
      .limit(1);
    const userCart = userCartData[0] || null;
    if (userCart) {
      const combinedItems = [...((userCart.items as CartItem[]) || [])];
      for (const item of (sessionCart.items as CartItem[]) || []) {
        const existingItemIndex = combinedItems.findIndex(
          (existingItem) =>
            existingItem.product_id === item.product_id &&
            existingItem.size === item.size
        );
        if (existingItemIndex >= 0) {
          combinedItems[existingItemIndex].quantity += item.quantity;
        } else {
          combinedItems.push(item);
        }
      }
      await db
        .update(cartsTable)
        .set({items: combinedItems, updated_at: new Date()})
        .where(eq(cartsTable.id, userCart.id));
      await db.delete(cartsTable).where(eq(cartsTable.id, sessionCart.id));
    } else {
      await db
        .update(cartsTable)
        .set({user_id: userId, session_id: null, updated_at: new Date()})
        .where(eq(cartsTable.id, sessionCart.id));
    }
    return {success: true, message: `Cart transferred successfully`};
  } catch (error) {
    console.error('Unexpected error transferring cart on login:', error);
    return {success: false, error, message: 'Failed to transfer cart'};
  }
}
