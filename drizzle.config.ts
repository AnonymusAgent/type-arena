import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Same precedence Next.js uses: .env.local wins over .env, real env vars win over both.
config({ path: [".env.local", ".env"], quiet: true });

const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
  // `push` only applies the difference between this schema and the live database:
  // missing tables/columns/indexes are created and widened, it never truncates data.
  strict: true,
  verbose: true,
});
