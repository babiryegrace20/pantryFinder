import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Configure WebSocket for Neon in non-browser environments
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
