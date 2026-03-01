import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: ["./app/db/schema.ts", "./app/db/auth-schema.ts"],
	out: "./drizzle/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/1390501308abaa748f4deb463ee62883a400826e84c600091274f8bc45629bb3.sqlite",
	},
});