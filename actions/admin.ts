import {db} from '@/drizzle/index';
import {productsTable, mainCategories, ordersTable} from '@/drizzle/db/schema';
import { formatPrice } from '@/utils/helpers';

// --------------------------------------------------------------

const formatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Europe/Stockholm',
});

// --------------------------------------------------------------

export async function getAllProducts() {
  const products = await db.select().from(productsTable);

  const formattedProducts = products.map((product) => ({
    ...product,
    created_at: formatter.format(product.created_at as Date),
    updated_at: formatter.format(product.updated_at as Date),
  }));

  return formattedProducts;
}

// --------------------------------------------------------------

export async function getMainCategories() {
  const categories = await db.select().from(mainCategories);

  const formattedCategories = categories.map((category) => ({
    ...category,
    created_at: formatter.format(category.created_at as Date),
    updated_at: formatter.format(category.updated_at as Date),
  }));

  return formattedCategories;
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

  const formattedOrders = orders.map((order) => ({
    ...order,
    created_at: formatter.format(order.created_at as Date),
    updated_at: formatter.format(order.updated_at as Date),
    total_amount: formatPrice(order.total_amount),
  }));



  return formattedOrders;
}
