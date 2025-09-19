'use server';

import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {getOrCreateSessionId, getSessionId} from '@/utils/cookies';
import type {NewFavorite} from '@/lib/types/db-types';
import {db} from '@/drizzle/index';
import {favoritesTable, productsTable} from '@/drizzle/db/schema';
import {eq, and, isNull, sql, inArray} from 'drizzle-orm';
import {NEW_PRODUCT_DAYS} from '@/lib/constants';

export async function getFavorites() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const sessionId = await getSessionId();

    const baseQuery = db
      .select({
        id: favoritesTable.id,
        user_id: favoritesTable.user_id,
        session_id: favoritesTable.session_id,
        product_id: favoritesTable.product_id,
        created_at: favoritesTable.created_at,

        product: {
          id: productsTable.id,
          name: productsTable.name,
          price: productsTable.price,
          brand: productsTable.brand,
          color: productsTable.color,
          sizes: productsTable.sizes,
          images: productsTable.images,
          slug: productsTable.slug,
          category: productsTable.category,
          created_at: productsTable.created_at,
          isNew:
            sql<boolean>`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(
              NEW_PRODUCT_DAYS.toString()
            )} days'`.as('isNew'),
        },
      })
      .from(favoritesTable)
      .innerJoin(
        productsTable,
        eq(favoritesTable.product_id, productsTable.id)
      );

    if (user) {
      const favorites = await baseQuery.where(
        eq(favoritesTable.user_id, user.id)
      );
      return {favorites};
    } else if (sessionId) {
      const favorites = await baseQuery.where(
        and(
          eq(favoritesTable.session_id, sessionId),
          isNull(favoritesTable.user_id)
        )
      );
      return {favorites};
    } else {
      return {favorites: []};
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {
      favorites: [],
      error: 'Failed to fetch favorites',
    };
  }
}

export async function removeFromFavorites(productId: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (user) {
      await db
        .delete(favoritesTable)
        .where(
          and(
            eq(favoritesTable.user_id, user.id),
            eq(favoritesTable.product_id, productId)
          )
        );
    } else {
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

    const {favorites} = await getFavorites();
    return {success: true, favorites};
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return {success: false, error: 'Failed to remove item from favorites'};
  }
}

export async function toggleFavorite(productId: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (user) {
      const deleteResult = await db
        .delete(favoritesTable)
        .where(
          and(
            eq(favoritesTable.user_id, user.id),
            eq(favoritesTable.product_id, productId)
          )
        );

      if (deleteResult.rowCount === 0) {
        const newFavorite: NewFavorite = {
          user_id: user.id,
          session_id: null,
          product_id: productId,
        };
        await db.insert(favoritesTable).values({
          ...newFavorite,
          created_at: new Date(),
        });
      }
    } else {
      const sessionId = await getSessionId();
      if (!sessionId) {
        const newSessionId = await getOrCreateSessionId();
        const newFavorite: NewFavorite = {
          user_id: null,
          session_id: newSessionId,
          product_id: productId,
        };
        await db.insert(favoritesTable).values({
          ...newFavorite,
          created_at: new Date(),
        });
      } else {
        const deleteResult = await db
          .delete(favoritesTable)
          .where(
            and(
              eq(favoritesTable.session_id, sessionId),
              eq(favoritesTable.product_id, productId),
              isNull(favoritesTable.user_id)
            )
          );

        if (deleteResult.rowCount === 0) {
          const newFavorite: NewFavorite = {
            user_id: null,
            session_id: sessionId,
            product_id: productId,
          };
          await db.insert(favoritesTable).values({
            ...newFavorite,
            created_at: new Date(),
          });
        }
      }
    }

    const {favorites} = await getFavorites();
    return {
      success: true,
      favorites,
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return {success: false, error: 'Failed to toggle favorite'};
  }
}

export async function transferFavoritesOnLogin(userId: string) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) return {success: true, message: 'No session_id found'};

    // Hämta båda listorna
    const sessionFavorites = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, sessionId),
          isNull(favoritesTable.user_id)
        )
      );

    if (!sessionFavorites.length)
      return {success: true, message: 'No session favorites found'};

    const userFavorites = await db
      .select({product_id: favoritesTable.product_id})
      .from(favoritesTable)
      .where(eq(favoritesTable.user_id, userId));

    const existingProductIds = new Set(
      userFavorites.map((fav) => fav.product_id)
    );

    // Sortera i minnet vad som ska göras, utan databasanrop
    const idsToUpdate: string[] = [];
    const idsToDelete: string[] = [];

    for (const sessionFav of sessionFavorites) {
      if (!existingProductIds.has(sessionFav.product_id)) {
        // Denna favorit är unik och ska kopplas till användaren
        idsToUpdate.push(sessionFav.id);
      } else {
        // Denna favorit är en dubblett och ska tas bort
        idsToDelete.push(sessionFav.id);
      }
    }

    // Kör en bulk-update för ALLA favoriter som ska uppdateras
    if (idsToUpdate.length > 0) {
      await db
        .update(favoritesTable)
        .set({user_id: userId, session_id: null})
        .where(inArray(favoritesTable.id, idsToUpdate));
    }

    // Kör en bulk-delete för ALLA favoriter som ska tas bort
    if (idsToDelete.length > 0) {
      await db
        .delete(favoritesTable)
        .where(inArray(favoritesTable.id, idsToDelete));
    }

    console.log('Favorites transferred successfully');
    return {
      success: true,
      message: `Favorites transferred successfully (${sessionFavorites.length} items processed)`,
    };
  } catch (error) {
    console.error('Unexpected error transferring favorites on login:', error);
    return {success: false, error: 'Failed to transfer favorites'};
  }
}
