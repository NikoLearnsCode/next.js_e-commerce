'use server';

import {createClient} from '@/utils/supabase/server';
import {getOrCreateSessionId, getSessionId} from '@/utils/cookies';
import {CartItem} from '@/lib/validators';

// Get cart based on session or user ID
export async function getCart() {
  try {
    const supabase = await createClient();

    // Check if user is logged in
    const {
      data: {user},
    } = await supabase.auth.getUser();

    let cart;

    if (user) {
      // If logged in, try to find user's cart
      const {data} = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      cart = data;
    } else {
      // If not logged in, check if there is a session_id
      const sessionId = await getSessionId();

      // If no session_id, return an empty cart
      if (!sessionId) {
        return {cart: null, cartItems: []};
      }

      // Otherwise get the cart associated with session_id
      const {data} = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .is('user_id', null)
        .maybeSingle();

      cart = data;
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
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add/update product to cart
export async function addToCart(cartItem: CartItem) {
  try {
    const supabase = await createClient();

    // Check if user is logged in
    const {
      data: {user},
    } = await supabase.auth.getUser();

    // Get or create session_id (only if user is not logged in)
    const sessionId = user ? null : await getOrCreateSessionId();

    // Get cart
    let {cart} = await getCart();

    // If no cart exists, create a new one
    if (!cart) {
      const newCart = {
        session_id: user ? null : sessionId,
        user_id: user?.id || null,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const {data: createdCart, error: createError} = await supabase
        .from('carts')
        .insert(newCart)
        .select()
        .single();

      if (createError) throw createError;
      cart = createdCart;
    }

    // Check if product already exists in cart
    const currentCartItems = cart.items || [];
    const existingItemIndex = currentCartItems.findIndex(
      (item: CartItem) =>
        item.product_id === cartItem.product_id && item.size === cartItem.size
    );

    let updatedCartItems;

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      updatedCartItems = [...currentCartItems];
      updatedCartItems[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new product
      updatedCartItems = [...currentCartItems, cartItem];
    }

    // Update cart
    const {error: updateError} = await supabase
      .from('carts')
      .update({
        items: updatedCartItems,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cart.id);

    if (updateError) throw updateError;

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

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Remove product from cart
export async function removeFromCart(itemId: string) {
  try {
    const supabase = await createClient();

    // Get cart
    const {cart} = await getCart();

    // If no cart exists, return success (nothing to remove)
    if (!cart) {
      return {success: true, cartItems: []};
    }

    const currentCartItems = cart.items || [];
    const updatedCartItems = currentCartItems.filter(
      (item: CartItem) => item.id !== itemId
    );

    // If cart becomes empty after removal, delete the entire cart from the database
    if (updatedCartItems.length === 0) {
      const {error: deleteError} = await supabase
        .from('carts')
        .delete()
        .eq('id', cart.id);

      if (deleteError) {
        console.error('Error deleting empty cart:', deleteError);
        return {success: false, error: 'Failed to delete empty cart'};
      }

      return {success: true, cartItems: []};
    }

    // Otherwise update cart with the remaining products
    const {error: updateError} = await supabase
      .from('carts')
      .update({
        items: updatedCartItems,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cart.id);

    if (updateError) throw updateError;

    return {success: true, cartItems: updatedCartItems};
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {success: false, error: 'Failed to remove item from cart'};
  }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Update quantity for a product
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const supabase = await createClient();

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

    const currentCartItems = cart.items || [];
    const itemIndex = currentCartItems.findIndex(
      (item: CartItem) => item.id === itemId
    );

    if (itemIndex === -1) {
      return {success: false, error: 'Item not found in cart'};
    }

    const updatedCartItems = [...currentCartItems];
    updatedCartItems[itemIndex].quantity = quantity;

    // Update cart
    const {error: updateError} = await supabase
      .from('carts')
      .update({
        items: updatedCartItems,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cart.id);

    if (updateError) throw updateError;

    return {success: true, cartItems: updatedCartItems};
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return {success: false, error: 'Failed to update item quantity'};
  }
}

//Clear cart
export async function clearCart() {
  try {
    const supabase = await createClient();
    const {cart} = await getCart();
    if (!cart) {
      return {success: true, cartItems: []};
    }
    const {error: deleteError} = await supabase
      .from('carts')
      .delete()
      .eq('id', cart.id);

    if (deleteError) throw deleteError;
    return {success: true, cartItems: []};
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {success: false, error: 'Failed to clear cart'};
  }
}

// Clean up empty carts from database
// This function can be called regularly via a cron job or similar
/*
export async function cleanupEmptyCarts() {
  try {
    const supabase = await createClient();
    
    // Delete carts with an empty items array
    const {error: deleteEmptyError} = await supabase
      .from('carts')
      .delete()
      .is('items', null)
      .or('items.length.eq.0');
    
    if (deleteEmptyError) {
      console.error('Error deleting empty carts:', deleteEmptyError);
      return {success: false, error: deleteEmptyError};
    }
    
    // Delete old anonymous carts (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const {error: deleteOldError} = await supabase
      .from('carts')
      .delete()
      .is('user_id', null)
      .lt('updated_at', thirtyDaysAgo.toISOString());
    
    if (deleteOldError) {
      console.error('Error deleting old anonymous carts:', deleteOldError);
      return {success: false, error: deleteOldError};
    }
    
    return {success: true};
  } catch (error) {
    console.error('Error cleaning up carts:', error);
    return {success: false, error};
  }
}
*/
