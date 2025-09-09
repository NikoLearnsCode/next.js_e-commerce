import { db } from "@/drizzle";
import { ordersTable } from "@/drizzle/db/schema";

/* export async function getAllOrdersWithItems() {
  const orderWithItems = await db.query.ordersTable.findMany({
    with: {
      orderItems: true,
    },
  });

  return orderWithItems;
} */

export async function getAllOrders() {
  const orders = await db.select().from(ordersTable);
  return orders;
}
