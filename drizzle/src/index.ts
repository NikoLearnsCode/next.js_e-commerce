import 'dotenv/config';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from './db/schema';

// Skapa pool för PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Skapa Drizzle-instans
export const db = drizzle(pool, {schema});

// Exportera schema för användning i applikationen
export {schema};