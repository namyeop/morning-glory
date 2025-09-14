import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/db/schema.pg.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@postgres:5432/morning_glory",
  },
});
