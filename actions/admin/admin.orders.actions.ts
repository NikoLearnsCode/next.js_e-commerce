import {db} from '@/drizzle';
import {or, sql} from 'drizzle-orm';
import {ordersTable} from '@/drizzle/db/schema';

export async function getAllOrders(searchTerm?: string) {
  if (!searchTerm?.trim()) {
    const orders = await db.select().from(ordersTable);
    return orders;
  }

  const searchPattern = `%${searchTerm.trim()}%`;

  const orders = await db
    .select()
    .from(ordersTable)
    .where(
      or(
        // För UUID, konvertera till text först
        sql`${ordersTable.id}::text ILIKE ${searchPattern}`,
        // JSONB search för delivery_info fält
        sql`${ordersTable.delivery_info}->>'firstName' ILIKE ${searchPattern}`,
        sql`${ordersTable.delivery_info}->>'lastName' ILIKE ${searchPattern}`,
        sql`${ordersTable.delivery_info}->>'email' ILIKE ${searchPattern}`,
        sql`${ordersTable.delivery_info}->>'phone' ILIKE ${searchPattern}`,
        sql`${ordersTable.delivery_info}->>'address' ILIKE ${searchPattern}`,
        sql`${ordersTable.delivery_info}->>'postalCode' ILIKE ${searchPattern}`,
        sql`${ordersTable.delivery_info}->>'city' ILIKE ${searchPattern}`
      )
    );

  return orders;
}
