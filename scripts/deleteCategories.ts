import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import {sql} from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({path: '.env'});

const resetCategoriesTable = async () => {
  console.log('🔵 Starting the reset process for the categories table.');

  try {
    console.log('🗑️ Truncating table and resetting ID counter...');

    await db.execute(
      sql`TRUNCATE TABLE ${categories} RESTART IDENTITY CASCADE;`
    );

    console.log('✅ The table has been reset successfully.');
    console.log('   - All rows have been deleted.');
    console.log('   - The ID counter is reset and will now start from 1.');
  } catch (error) {
    console.error('❌ An error occurred during the reset process:', error);
    process.exit(1);
  } finally {
    console.log('\n🔚 Reset process finished.');
  }
};

resetCategoriesTable();
