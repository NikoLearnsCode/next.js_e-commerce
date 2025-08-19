import 'dotenv/config';
import {config} from 'dotenv';
import {defineConfig} from 'drizzle-kit';

config({path: '.env.local'});

export default defineConfig({
  out: './drizzle/migrations',
  schema: './drizzle/src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'niklas',
    database: 'db',
    ssl: false,
  },
});
