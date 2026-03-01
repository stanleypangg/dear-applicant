import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: ["./app/db/schema.ts", "./app/db/auth-schema.ts"],
	out: "./drizzle/migrations",
	dialect: "sqlite",
});