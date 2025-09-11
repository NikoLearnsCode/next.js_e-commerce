import { db } from "@/drizzle";
import { ordersTable } from "@/drizzle/db/schema";

export async function getAllOrders() {
  const orders = await db.select().from(ordersTable);
  return orders;
}
