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

/* ------------------------------------------------- */
export async function getCart() {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    let cart;

    if (user) {
      // If logged in, try to find user's cart
      const cartData = await db
        .select()
        .from(cartsTable)
        .where(eq(cartsTable.user_id, user.id))
        .limit(1);

      cart = cartData[0] || null;
    } else {
      // If not logged in, check if there is a session_id
      const sessionId = await getSessionId();

      // If no session_id, return an empty cart
      if (!sessionId) {
        return {cart: null, cartItems: []};
      }

      // Otherwise get the cart associated with session_id
      const cartData = await db
        .select()
        .from(cartsTable)
        .where(
          and(eq(cartsTable.session_id, sessionId), isNull(cartsTable.user_id))
        )
        .limit(1);

      cart = cartData[0] || null;
    }

    // If no cart found, return an empty cart without creating a new one
    if (!cart) {
      return {cart: null, cartItems: []};
    }

    return {cart, cartItems: cart?.items || []};
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {cart: null, cartItems: [], error: 'Failed to fetch cart'};
  }
}

/* ------------------------------------------------- */
export async function addToCart(cartItem: CartItem) {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Get or create session_id (only if user is not logged in)
    const sessionId = user ? null : await getOrCreateSessionId();

    // Get cart
    let {cart} = await getCart();

    // If no cart exists, create a new one
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

    // Check if product already exists in cart
    const currentCartItems = (cart.items as CartItem[]) || [];
    const existingItemIndex = currentCartItems.findIndex(
      (item: CartItem) =>
        item.product_id === cartItem.product_id && item.size === cartItem.size
    );

    let updatedCartItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      updatedCartItems = [...currentCartItems];
      updatedCartItems[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new product
      updatedCartItems = [...currentCartItems, cartItem];
    }

    // Update cart
    await db
      .update(cartsTable)
      .set({
        items: updatedCartItems,
        updated_at: new Date(),
      })
      .where(eq(cartsTable.id, cart.id));

    return {
      success: true,
      cartItems: updatedCartItems,
      cart: cart,
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {success: false, error: 'Failed to add item to cart'};
  }
}

/* ------------------------------------------------- */
export async function removeFromCart(itemId: string) {
  try {
    // Get cart
    const {cart} = await getCart();

    // If no cart exists, return success (nothing to remove)
    if (!cart) {
      return {success: true, cartItems: []};
    }

    const currentCartItems = (cart.items as CartItem[]) || [];
    const updatedCartItems = currentCartItems.filter(
      (item: CartItem) => item.id !== itemId
    );

    // If cart becomes empty after removal, delete the entire cart from the database
    if (updatedCartItems.length === 0) {
      await db.delete(cartsTable).where(eq(cartsTable.id, cart.id));
      const cookieStore = await cookies();
      cookieStore.delete(CART_SESSION_COOKIE);
      return {success: true, cartItems: []};
    }

    // Otherwise update cart with the remaining products
    await db
      .update(cartsTable)
      .set({
        items: updatedCartItems,
        updated_at: new Date(),
      })
      .where(eq(cartsTable.id, cart.id));

    return {success: true, cartItems: updatedCartItems};
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {success: false, error: 'Failed to remove item from cart'};
  }
}

/* ------------------------------------------------- */
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    // If quantity is 0 or less, remove product from cart
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    // Get cart
    const {cart} = await getCart();

    // If no cart exists, return error
    if (!cart) {
      return {success: false, error: 'Cart not found'};
    }

    const currentCartItems = (cart.items as CartItem[]) || [];
    const itemIndex = currentCartItems.findIndex(
      (item: CartItem) => item.id === itemId
    );

    if (itemIndex === -1) {
      return {success: false, error: 'Item not found in cart'};
    }

    const updatedCartItems: CartItem[] = [...currentCartItems];
    updatedCartItems[itemIndex].quantity = quantity;

    // Update cart
    await db
      .update(cartsTable)
      .set({
        items: updatedCartItems,
        updated_at: new Date(),
      })
      .where(eq(cartsTable.id, cart.id));

    return {success: true, cartItems: updatedCartItems};
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return {success: false, error: 'Failed to update item quantity'};
  }
}

/* ------------------------------------------------- */
export async function clearCart() {
  try {
    const {cart} = await getCart();
    if (!cart) {
      return {success: true, cartItems: []};
    }
    await db.delete(cartsTable).where(eq(cartsTable.id, cart.id));
    return {success: true, cartItems: []};
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {success: false, error: 'Failed to clear cart'};
  }
}

/* ------------------------------------------------- */
export async function transferCartOnLogin(userId: string) {
  try {
    const sessionId = await getSessionId();

    // If no session_id, do nothing
    if (!sessionId) {
      console.log('No session_id found, nothing to transfer');
      return {success: true, message: 'No session_id found'};
    }

    console.log(
      'Starting cart transfer with sessionId:',
      sessionId,
      'and userId:',
      userId
    );

    // Find cart associated with current session_id
    const sessionCartData = await db
      .select()
      .from(cartsTable)
      .where(
        and(eq(cartsTable.session_id, sessionId), isNull(cartsTable.user_id))
      )
      .limit(1);

    const sessionCart = sessionCartData[0] || null;

    // If no anonymous cart found, do nothing
    if (!sessionCart) {
      console.log('No session cart found');
      return {success: true, message: 'No session cart found'};
    }

    // console.log('Found session cart:', sessionCart);

    // Check if user already has a cart
    const userCartData = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.user_id, userId))
      .limit(1);

    const userCart = userCartData[0] || null;

    if (userCart) {
      console.log('Found user cart, merging items');
      // User already has a cart - merge contents
      const combinedItems = [...((userCart.items as CartItem[]) || [])];

      // Add each item from sessionCart
      for (const item of (sessionCart.items as CartItem[]) || []) {
        const existingItemIndex = combinedItems.findIndex(
          (existingItem) =>
            existingItem.product_id === item.product_id &&
            existingItem.size === item.size
        );

        if (existingItemIndex >= 0) {
          // If product already exists, update quantity
          combinedItems[existingItemIndex].quantity += item.quantity;
        } else {
          // Otherwise add as new product
          combinedItems.push(item);
        }
      }

      // Update user's cart with the merged contents
      await db
        .update(cartsTable)
        .set({
          items: combinedItems,
          updated_at: new Date(),
        })
        .where(eq(cartsTable.id, userCart.id));

      // Delete the anonymous cart
      await db.delete(cartsTable).where(eq(cartsTable.id, sessionCart.id));

      console.log('Cart merged successfully and session cart deleted');
    } else {
      console.log('No user cart found, transferring session cart');
      // User has no cart - transfer the anonymous cart
      await db
        .update(cartsTable)
        .set({
          user_id: userId,
          session_id: null,
          updated_at: new Date(),
        })
        .where(eq(cartsTable.id, sessionCart.id));

      console.log('Session cart transferred to user');
    }

    return {
      success: true,
      message: `Cart transferred successfully (${sessionCart.items.length} items)`,
    };
  } catch (error) {
    console.error('Unexpected error transferring cart on login:', error);
    return {success: false, error, message: 'Failed to transfer cart'};
  }
}
