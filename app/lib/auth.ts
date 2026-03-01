import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/db";

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: "sqlite" }),
	emailAndPassword: { enabled: true },
	trustedOrigins: [env.ORIGIN],
});
