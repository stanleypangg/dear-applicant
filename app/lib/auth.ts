import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "~/db";

const resend = new Resend(env.RESEND_API_KEY);

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

const socialProviders: Record<string, unknown> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
	socialProviders.google = {
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
	};
}

if (env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET) {
	socialProviders.microsoft = {
		clientId: env.MICROSOFT_CLIENT_ID,
		clientSecret: env.MICROSOFT_CLIENT_SECRET,
		tenantId: env.MICROSOFT_TENANT_ID,
	};
}

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.ORIGIN,
	database: drizzleAdapter(db, { provider: "sqlite" }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			const { error } = await resend.emails.send({
				from: env.EMAIL_FROM,
				to: user.email,
				subject: "Reset your password — dear applicant",
				html: `<p>Hi ${escapeHtml(user.name)},</p><p>Click the link below to reset your password:</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`,
			});
			if (error) {
				console.error("Failed to send password reset email:", error);
				throw new Error("Failed to send password reset email");
			}
		},
		revokeSessionsOnPasswordReset: true,
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			const { error } = await resend.emails.send({
				from: env.EMAIL_FROM,
				to: user.email,
				subject: "Verify your email — dear applicant",
				html: `<p>Hi ${escapeHtml(user.name)},</p><p>Click the link below to verify your email address:</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`,
			});
			if (error) {
				console.error("Failed to send verification email:", error);
				throw new Error("Failed to send verification email");
			}
		},
	},
	trustedOrigins: [env.ORIGIN],
	socialProviders,
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "microsoft", "email-password"],
		},
	},
	rateLimit: {
		window: 60,
		max: 100,
		customRules: {
			"/send-verification-email": {
				window: 60,
				max: 1,
			},
			"/request-password-reset": {
				window: 60,
				max: 1,
			},
		},
	},
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["cf-connecting-ip"],
		},
	},
});
