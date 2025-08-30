'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth.config';
import {getOrCreateSessionId, getSessionId} from '@/utils/cookies';
import type {NewFavorite, Product} from '@/lib/types/db';
import {db} from '@/drizzle/index';
import {favoritesTable, productsTable} from '@/drizzle/db/schema';
import {eq, and, isNull} from 'drizzle-orm';

/* ------------------------------------------------- */
export async function getFavorites() {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    let favorites;

    if (user) {
      // If logged in, find user's favorites with product data via join
      favorites = await db
        .select({
          id: favoritesTable.id,
          user_id: favoritesTable.user_id,
          session_id: favoritesTable.session_id,
          product_id: favoritesTable.product_id,
          created_at: favoritesTable.created_at,
          product: productsTable,
        })
        .from(favoritesTable)
        .innerJoin(
          productsTable,
          eq(favoritesTable.product_id, productsTable.id)
        )
        .where(eq(favoritesTable.user_id, user.id));
    } else {
      // If not logged in, check if there is a session_id
      const sessionId = await getSessionId();

      // If no session_id, return empty favorites
      if (!sessionId) {
        return {favorites: []};
      }

      // Otherwise get favorites associated with session_id with product data via join
      favorites = await db
        .select({
          id: favoritesTable.id,
          user_id: favoritesTable.user_id,
          session_id: favoritesTable.session_id,
          product_id: favoritesTable.product_id,
          created_at: favoritesTable.created_at,
          product: productsTable,
        })
        .from(favoritesTable)
        .innerJoin(
          productsTable,
          eq(favoritesTable.product_id, productsTable.id)
        )
        .where(
          and(
            eq(favoritesTable.session_id, sessionId),
            isNull(favoritesTable.user_id)
          )
        );
    }

    return {favorites};
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {
      favorites: [],
      error: 'Failed to fetch favorites',
    };
  }
}

/* ------------------------------------------------- */
export async function addToFavorites(product: Product) {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Get or create session_id (only if user is not logged in)
    const sessionId = user ? null : await getOrCreateSessionId();

    // Check if product is already in favorites
    let existingFavorite;
    if (user) {
      const existing = await db
        .select()
        .from(favoritesTable)
        .where(
          and(
            eq(favoritesTable.user_id, user.id),
            eq(favoritesTable.product_id, product.id)
          )
        )
        .limit(1);
      existingFavorite = existing[0] || null;
    } else if (sessionId) {
      const existing = await db
        .select()
        .from(favoritesTable)
        .where(
          and(
            eq(favoritesTable.session_id, sessionId),
            eq(favoritesTable.product_id, product.id),
            isNull(favoritesTable.user_id)
          )
        )
        .limit(1);
      existingFavorite = existing[0] || null;
    }

    // If already in favorites, return current favorites
    if (existingFavorite) {
      const {favorites} = await getFavorites();
      return {
        success: true,
        favorites,
        message: 'Product already in favorites',
      };
    }

    // Add to favorites - only store the relationship, no product data duplication
    const newFavorite: NewFavorite = {
      user_id: user?.id || null,
      session_id: user ? null : sessionId,
      product_id: product.id,
    };

    await db.insert(favoritesTable).values(newFavorite);

    // Return updated favorites
    const {favorites} = await getFavorites();
    return {
      success: true,
      favorites,
      message: 'Added to favorites',
    };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return {success: false, error: 'Failed to add item to favorites'};
  }
}

/* ------------------------------------------------- */
export async function removeFromFavorites(productId: string) {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (user) {
      // Remove from user's favorites
      await db
        .delete(favoritesTable)
        .where(
          and(
            eq(favoritesTable.user_id, user.id),
            eq(favoritesTable.product_id, productId)
          )
        );
    } else {
      // Remove from session favorites
      const sessionId = await getSessionId();
      if (sessionId) {
        await db
          .delete(favoritesTable)
          .where(
            and(
              eq(favoritesTable.session_id, sessionId),
              eq(favoritesTable.product_id, productId),
              isNull(favoritesTable.user_id)
            )
          );
      }
    }

    // Return updated favorites
    const {favorites} = await getFavorites();
    return {success: true, favorites};
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return {success: false, error: 'Failed to remove item from favorites'};
  }
}

/* ------------------------------------------------- */
export async function toggleFavorite(product: Product) {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Check if product is already in favorites
    let existingFavorite;
    if (user) {
      const existing = await db
        .select()
        .from(favoritesTable)
        .where(
          and(
            eq(favoritesTable.user_id, user.id),
            eq(favoritesTable.product_id, product.id)
          )
        )
        .limit(1);
      existingFavorite = existing[0] || null;
    } else {
      const sessionId = await getSessionId();
      if (sessionId) {
        const existing = await db
          .select()
          .from(favoritesTable)
          .where(
            and(
              eq(favoritesTable.session_id, sessionId),
              eq(favoritesTable.product_id, product.id),
              isNull(favoritesTable.user_id)
            )
          )
          .limit(1);
        existingFavorite = existing[0] || null;
      }
    }

    if (existingFavorite) {
      // Remove from favorites
      return await removeFromFavorites(product.id);
    } else {
      // Add to favorites
      return await addToFavorites(product);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return {success: false, error: 'Failed to toggle favorite'};
  }
}

/* ------------------------------------------------- */
export async function transferFavoritesOnLogin(userId: string) {
  try {
    const sessionId = await getSessionId();

    // If no session_id, do nothing
    if (!sessionId) {
      console.log('No session_id found, nothing to transfer');
      return {success: true, message: 'No session_id found'};
    }

    console.log(
      'Starting favorites transfer with sessionId:',
      sessionId,
      'and userId:',
      userId
    );

    // Find favorites associated with current session_id
    const sessionFavorites = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, sessionId),
          isNull(favoritesTable.user_id)
        )
      );

    // If no anonymous favorites found, do nothing
    if (!sessionFavorites.length) {
      console.log('No session favorites found');
      return {success: true, message: 'No session favorites found'};
    }

    // Get user's existing favorites
    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.user_id, userId));

    const existingProductIds = new Set(
      userFavorites.map((fav) => fav.product_id)
    );

    // Transfer non-duplicate favorites
    for (const sessionFav of sessionFavorites) {
      if (!existingProductIds.has(sessionFav.product_id)) {
        // Transfer this favorite to the user
        await db
          .update(favoritesTable)
          .set({
            user_id: userId,
            session_id: null,
          })
          .where(eq(favoritesTable.id, sessionFav.id));
      } else {
        // Delete duplicate session favorite
        await db
          .delete(favoritesTable)
          .where(eq(favoritesTable.id, sessionFav.id));
      }
    }

    console.log('Favorites transferred successfully');
    return {
      success: true,
      message: `Favorites transferred successfully (${sessionFavorites.length} items processed)`,
    };
  } catch (error) {
    console.error('Unexpected error transferring favorites on login:', error);
    return {success: false, error, message: 'Failed to transfer favorites'};
  }
}

/* ------------------------------------------------- */
export async function isFavorite(productId: string): Promise<boolean> {
  try {
    // Check if user is logged in with NextAuth
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (user) {
      const existing = await db
        .select()
        .from(favoritesTable)
        .where(
          and(
            eq(favoritesTable.user_id, user.id),
            eq(favoritesTable.product_id, productId)
          )
        )
        .limit(1);
      return existing.length > 0;
    } else {
      const sessionId = await getSessionId();
      if (sessionId) {
        const existing = await db
          .select()
          .from(favoritesTable)
          .where(
            and(
              eq(favoritesTable.session_id, sessionId),
              eq(favoritesTable.product_id, productId),
              isNull(favoritesTable.user_id)
            )
          )
          .limit(1);
        return existing.length > 0;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking if favorite:', error);
    return false;
  }
}
