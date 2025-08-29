import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({path: '.env'});

const deleteCategories = async () => {
  try {
    await db.delete(categories);
    console.log('✅ Kategorier raderade.');
  } catch (error) {
    console.error('❌ Ett fel uppstod:', error);
    process.exit(1);
  }
  process.exit(0);
};

deleteCategories();
