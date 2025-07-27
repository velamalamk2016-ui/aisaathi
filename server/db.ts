import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

const sql = neon(
  process.env.DATABASE_URL ??
  "postgresql://neondb_owner:npg_BEOhSSSTqjOQ@ep-quiet-moon-a5m7y6k3.us-east-2.aws.neon.tech/neondb?sslmode=require"
);

export const db = drizzle(sql, { schema });
