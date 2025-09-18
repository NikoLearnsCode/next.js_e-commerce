import {db} from '@/drizzle/index';
import {productsTable} from '@/drizzle/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({path: '.env'});

const resetProductsTable = async () => {
  console.log('🔵 Starting the reset process for the products table.');

  try {
    console.log('🗑️ Deleting all rows from the table...');

    await db.delete(productsTable);

    console.log('✅ The table has been reset successfully.');
    console.log('   - All rows have been deleted.');
  } catch (error) {
    console.error('❌ An error occurred during the reset process:', error);
    process.exit(1);
  } finally {
    console.log('\n🔚 Reset process finished.');
  }
};

resetProductsTable();
