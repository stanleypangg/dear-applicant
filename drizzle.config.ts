import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: ["./app/db/schema.ts", "./app/db/auth-schema.ts"],
	out: "./drizzle/migrations",
	dialect: "sqlite",
	// For Drizzle Studio: find your local D1 path with
	// ls .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite
	dbCredentials: {
		url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/<YOUR-UUID>.sqlite",
	},
});