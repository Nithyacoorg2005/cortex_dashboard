import { Pool } from "pg";

declare global {
  var _dbPool: Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("Missing Database URL");
}

export const pool =
  global._dbPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  global._dbPool = pool;
}

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
