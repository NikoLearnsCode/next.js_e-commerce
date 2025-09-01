import {db} from '@/drizzle/index';
import {productsTable, ordersTable, categories} from '@/drizzle/db/schema';
import {asc} from 'drizzle-orm';
import {buildCategoryTree} from '@/utils/category-builder';

// PRODUCTS
// --------------------------------------------------------------

export async function getAllProducts() {
  const products = await db.select().from(productsTable);
  return products;
}

// CATEGORIES
// --------------------------------------------------------------

export async function getCategoriesWithChildren() {
  const flatCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));

  const categoryTree = buildCategoryTree(flatCategories);

  return categoryTree;
}

// --------------------------------------------------------------

// relations api order + order_items
export async function getAllOrdersWithItems() {
  const orderWithItems = await db.query.ordersTable.findMany({
    with: {
      orderItems: true,
    },
  });

  return orderWithItems;
}

// --------------------------------------------------------------

export async function getAllOrders() {
  const orders = await db.select().from(ordersTable);
  return orders;
}
