'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {
  CART_SESSION_COOKIE,
  getOrCreateSessionId,
  getSessionId,
} from '@/utils/cookies';
import type {
  NewCart,
  NewCartItem,
  AddToCartItem,
  CartItemWithProduct,
} from '@/lib/types/db';

import {db} from '@/drizzle/index';
import {cartsTable, cartItemsTable, productsTable} from '@/drizzle/db/schema';
import {eq, and, isNull, asc, inArray} from 'drizzle-orm';
import {cookies} from 'next/headers';
import Decimal from 'decimal.js';

async function getCartItemsWithProducts(cartId: string) {
  const cartItems = await db
    .select({
      // Cart item fields
      id: cartItemsTable.id,
      cart_id: cartItemsTable.cart_id,
      product_id: cartItemsTable.product_id,
      quantity: cartItemsTable.quantity,
      size: cartItemsTable.size,
      created_at: cartItemsTable.created_at,
      updated_at: cartItemsTable.updated_at,
      // Product fields via JOIN
      name: productsTable.name,
      price: productsTable.price,
      brand: productsTable.brand,
      color: productsTable.color,
      slug: productsTable.slug,
      images: productsTable.images,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.product_id, productsTable.id))
    .where(eq(cartItemsTable.cart_id, cartId))
    .orderBy(asc(cartItemsTable.created_at));

  return cartItems;
}

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

export async function addToCart(newItem: AddToCartItem) {
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
      const now = new Date();
      const createdCart = await db
        .insert(cartsTable)
        .values({
          ...newCart,
          created_at: now,
          updated_at: now,
        })
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
      const newCartItem: NewCartItem = {
        cart_id: cart.id,
        product_id: newItem.product_id,
        quantity: newItem.quantity,
        size: newItem.size,
      };
      const now = new Date();
      await db.insert(cartItemsTable).values({
        ...newCartItem,
        created_at: now,
        updated_at: now,
      });
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
    if (!sessionId) return {success: true, message: 'No session_id found'};

    // Hämta all data i förväg
    const sessionCartResult = await db
      .select()
      .from(cartsTable)
      .where(
        and(eq(cartsTable.session_id, sessionId), isNull(cartsTable.user_id))
      )
      .limit(1);
    const sessionCart = sessionCartResult[0];

    if (!sessionCart) return {success: true, message: 'No session cart found'};

    const userCartResult = await db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.user_id, userId))
      .limit(1);
    const userCart = userCartResult[0];

    // om ingen användarkorg finns, adoptera sessionskorgen
    if (!userCart) {
      await db
        .update(cartsTable)
        .set({user_id: userId, session_id: null, updated_at: new Date()})
        .where(eq(cartsTable.id, sessionCart.id));
      return {success: true, message: 'Cart transferred successfully'};
    }

    // annars, hämta alla items från båda korgarna
    const sessionItems = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cart_id, sessionCart.id));

    const userItems = await db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.cart_id, userCart.id));

    // Förbered för snabba uppslag
    const userItemsMap = new Map(
      userItems.map((item) => [`${item.product_id}_${item.size}`, item])
    );

    // Sortera i minnet VAD som ska göras
    const itemsToUpdateQuantity: {id: string; newQuantity: number}[] = [];
    const idsToMove: string[] = [];

    for (const sessionItem of sessionItems) {
      const key = `${sessionItem.product_id}_${sessionItem.size}`;
      const existingUserItem = userItemsMap.get(key);

      if (existingUserItem) {
        itemsToUpdateQuantity.push({
          id: existingUserItem.id,
          newQuantity: existingUserItem.quantity + sessionItem.quantity,
        });
      } else {
        idsToMove.push(sessionItem.id);
      }
    }

    // Utför operationerna i bulk
    const promises = [];

    if (itemsToUpdateQuantity.length > 0) {
      const updatePromise = db.transaction(async (tx) => {
        for (const item of itemsToUpdateQuantity) {
          await tx
            .update(cartItemsTable)
            .set({quantity: item.newQuantity, updated_at: new Date()})
            .where(eq(cartItemsTable.id, item.id));
        }
      });
      promises.push(updatePromise);
    }

    if (idsToMove.length > 0) {
      const movePromise = db
        .update(cartItemsTable)
        .set({cart_id: userCart.id, updated_at: new Date()})
        .where(inArray(cartItemsTable.id, idsToMove));
      promises.push(movePromise);
    }

    await Promise.all(promises);

    // Ta slutligen bort den nu tomma sessionskorgen
    await db.delete(cartsTable).where(eq(cartsTable.id, sessionCart.id));

    console.log('Cart transferred successfully');

    return {success: true, message: `Cart merged successfully`};
  } catch (error) {
    console.error('Unexpected error transferring cart on login:', error);
    return {success: false, message: 'Failed to transfer cart'};
  }
}
