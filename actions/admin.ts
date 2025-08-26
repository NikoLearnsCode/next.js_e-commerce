import {db} from '@/drizzle/index';
import {productsTable} from '@/drizzle/db/schema';

const formatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Europe/Stockholm',
});

export async function getAllProducts() {
  const products = await db.select().from(productsTable);

  const formattedProducts = products.map((product) => ({
    ...product,
    created_at: formatter.format(product.created_at as Date),
    updated_at: formatter.format(product.updated_at as Date),
  }));

  return formattedProducts;
}
