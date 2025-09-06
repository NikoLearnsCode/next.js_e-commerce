import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import {sql} from 'drizzle-orm';
import * as dotenv from 'dotenv';

import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

dotenv.config({path: '.env'});

const resetCategoriesTable = async () => {
  const rl = readline.createInterface({input, output});

  console.log('🔵 Starting the reset process for the categories table.');
  console.log('----------------------------------------------------');

  try {
    const answer = await rl.question(
      '❓ Are you sure you want to truncate and reset the "categories" table?\n   This action cannot be undone. (YES/NO): '
    );

    if (answer.toLowerCase().trim() !== 'yes') {
      console.log('\n❌ Operation cancelled by the user.');

      rl.close();
      process.exit(0);
    }

    console.log(
      '\n🗑️ Confirmation received. Truncating table and resetting ID counter...'
    );

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

    rl.close();
    console.log('\n🔚 Reset process finished.');
  }
};


resetCategoriesTable();
