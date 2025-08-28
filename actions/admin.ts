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

export async function getMainCategoriesWithSub() {
  const categoriesWithSub = await db.query.mainCategories.findMany({
    with: {
      subCategories: {
        with: {
          subSubCategories: {
            orderBy: (subSubCategories, {asc}) =>
              asc(subSubCategories.displayOrder),
          },
        },
        orderBy: (subCategories, {asc}) => asc(subCategories.displayOrder),
      },
    },
    orderBy: (mainCategories, {asc}) => [asc(mainCategories.displayOrder)],
  });

  return categoriesWithSub;
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
