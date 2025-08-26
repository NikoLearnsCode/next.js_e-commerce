import 'dotenv/config';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from './db/schema';


// Skapa pool för PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  ssl: false,
});

// Skapa Drizzle-instans
export const db = drizzle(pool, {schema});

// Exportera schema för användning i applikationen
export {schema};
