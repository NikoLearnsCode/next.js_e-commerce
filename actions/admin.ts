import {db} from '@/drizzle/index';
import {productsTable, mainCategories, ordersTable} from '@/drizzle/db/schema';

// --------------------------------------------------------------

export async function getAllProducts() {
  const products = await db.select().from(productsTable);
  return products;
}

// --------------------------------------------------------------

export async function getMainCategories() {
  const categories = await db.select().from(mainCategories);
  return categories;
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
