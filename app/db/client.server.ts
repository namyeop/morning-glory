import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.pg";

const { DATABASE_URL } = process.env;
const pool = new Pool({ connectionString: DATABASE_URL || "postgres://postgres:postgres@postgres:5432/morning_glory" });

export const db = drizzle(pool, { schema });
export type DB = typeof db;
