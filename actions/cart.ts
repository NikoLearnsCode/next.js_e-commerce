'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {
  CART_SESSION_COOKIE,
  getOrCreateSessionId,
  getSessionId,
} from '@/utils/cookies';
import type {
  NewCartItem,
  CartItemWithProduct,
  NewCart,
  NewDbCartItem,
} from '@/lib/validators';

import {db} from '@/drizzle/index';
import {cartsTable, cartItemsTable, productsTable} from '@/drizzle/db/schema';
import {eq, and, isNull, asc} from 'drizzle-orm';
import {cookies} from 'next/headers';
import Decimal from 'decimal.js';


// Hämtar cart items med produktdata via JOIN
async function getCartItemsWithProducts(cartId: string) {
  const cartItems = await db
    .select({
      // Cart item fields
      id: cartItemsTable.id,
      cart_id: cartItemsTable.cart_id,
      quantity: cartItemsTable.quantity,
      size: cartItemsTable.size,
      // Product fields via JOIN
      product_id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      brand: productsTable.brand,
      color: productsTable.color,
      slug: productsTable.slug,
      images: productsTable.images,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.product_id, productsTable.id))
    .where(eq(cartItemsTable.cart_id, cartId))
    .orderBy(asc(cartItemsTable.created_at));


  return cartItems as CartItemWithProduct[];
}

// Beräknar varukorgens totalpris med Decimal.js för exakthet
function calculateCartTotal(items: CartItemWithProduct[]): number {
  if (!items || items.length === 0) {
    return 0;
  }
  const total = items.reduce((sum, item) => {
    const itemTotal = new Decimal(item.price).times(item.quantity);
    return sum.plus(itemTotal);
  }, new Decimal(0));
  return total.toNumber();
}


// Beräknar det totala antalet produkter i varukorgen
function calculateItemCount(items: CartItemWithProduct[]): number {
  if (!items || items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => sum + item.quantity, 0);
}


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

    const cartItems = await getCartItemsWithProducts(cart.id);
    const totalPrice = calculateCartTotal(cartItems);
    const itemCount = calculateItemCount(cartItems);

    return {cart, cartItems, totalPrice, itemCount};
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {cart: null, cartItems: [], totalPrice: 0, itemCount: 0};
  }
}


export async function addToCart(newItem: NewCartItem) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const sessionId = user ? null : await getOrCreateSessionId();
    let {cart} = await getCart();

    // Skapa cart om den inte finns
    if (!cart) {
      const newCart: NewCart = {
        session_id: user ? null : sessionId,
        user_id: user?.id || null,
      };
      const createdCart = await db
        .insert(cartsTable)
        .values(newCart)
        .returning();
      if (!createdCart[0]) throw new Error('Failed to create cart');
      cart = createdCart[0];
    }

    // Kolla om samma produkt + storlek redan finns
    const existingItem = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.product_id, newItem.product_id),
          eq(cartItemsTable.size, newItem.size)
        )
      )
      .limit(1);

    if (existingItem[0]) {
      // Uppdatera kvantiteten
      await db
        .update(cartItemsTable)
        .set({
          quantity: existingItem[0].quantity + newItem.quantity,
          updated_at: new Date(),
        })
        .where(eq(cartItemsTable.id, existingItem[0].id));
    } else {
      // Lägg till nytt item
      const newDbCartItem: NewDbCartItem = {
        cart_id: cart.id,
        product_id: newItem.product_id,
        quantity: newItem.quantity,
        size: newItem.size,
      };
      await db.insert(cartItemsTable).values(newDbCartItem);
    }

    // Hämta uppdaterade data
    const cartItems = await getCartItemsWithProducts(cart.id);
    const totalPrice = calculateCartTotal(cartItems);
    const itemCount = calculateItemCount(cartItems);

    return {success: true, cartItems, totalPrice, itemCount};
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {success: false, error: 'Failed to add item to cart'};
  }
}


export async function removeFromCart(itemId: string) {
  try {
    const {cart} = await getCart();
    if (!cart) {
      return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
    }

    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));

    // Kolla om cart är tom nu
    const remainingItems = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cart_id, cart.id));

    if (remainingItems.length === 0) {
      // Ta bort cart om inga items finns kvar
      await db.delete(cartsTable).where(eq(cartsTable.id, cart.id));
      const cookieStore = await cookies();
      cookieStore.delete(CART_SESSION_COOKIE);
      return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
    }

    // Hämta uppdaterade data
    const cartItems = await getCartItemsWithProducts(cart.id);
    const totalPrice = calculateCartTotal(cartItems);
    const itemCount = calculateItemCount(cartItems);

    return {success: true, cartItems, totalPrice, itemCount};
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

    await db
      .update(cartItemsTable)
      .set({quantity, updated_at: new Date()})
      .where(eq(cartItemsTable.id, itemId));

    // Hämta uppdaterade data
    const cartItems = await getCartItemsWithProducts(cart.id);
    const totalPrice = calculateCartTotal(cartItems);
    const itemCount = calculateItemCount(cartItems);

    return {success: true, cartItems, totalPrice, itemCount};
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return {success: false, error: 'Failed to update item quantity'};
  }
}


export async function clearCart() {
  try {
    const {cart} = await getCart();
    if (!cart) {
      return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
    }

    await db.delete(cartsTable).where(eq(cartsTable.id, cart.id));
    const cookieStore = await cookies();
    cookieStore.delete(CART_SESSION_COOKIE);

    return {success: true, cartItems: [], totalPrice: 0, itemCount: 0};
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {success: false, error: 'Failed to clear cart'};
  }
}


export async function transferCartOnLogin(userId: string) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return {success: true, message: 'No session_id found'};
    }

    // Hitta session cart
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

    // Hitta user cart
    const userCartData = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.user_id, userId))
      .limit(1);
    const userCart = userCartData[0] || null;

    if (userCart) {
      // Merge session cart items into user cart
      const sessionItems = await db
        .select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cart_id, sessionCart.id));

      for (const sessionItem of sessionItems) {
        // Kolla om samma produkt + storlek redan finns i user cart
        const existingUserItem = await db
          .select()
          .from(cartItemsTable)
          .where(
            and(
              eq(cartItemsTable.cart_id, userCart.id),
              eq(cartItemsTable.product_id, sessionItem.product_id),
              eq(cartItemsTable.size, sessionItem.size)
            )
          )
          .limit(1);

        if (existingUserItem[0]) {
          // Uppdatera kvantiteten
          await db
            .update(cartItemsTable)
            .set({
              quantity: existingUserItem[0].quantity + sessionItem.quantity,
              updated_at: new Date(),
            })
            .where(eq(cartItemsTable.id, existingUserItem[0].id));
        } else {
          // Flytta item till user cart
          await db
            .update(cartItemsTable)
            .set({cart_id: userCart.id, updated_at: new Date()})
            .where(eq(cartItemsTable.id, sessionItem.id));
        }
      }

      // Ta bort session cart
      await db.delete(cartsTable).where(eq(cartsTable.id, sessionCart.id));
    } else {
      // Bara uppdatera session cart till user cart
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
