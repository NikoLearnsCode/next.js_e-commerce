import { db } from "@/drizzle";
import { productsTable } from "@/drizzle/db/schema";

export async function getAllProducts() {
  const products = await db.select().from(productsTable);
  return products;
}
