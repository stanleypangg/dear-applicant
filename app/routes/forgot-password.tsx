import { useState } from "react";
import { redirect, Link } from "react-router";
import { getOptionalSession } from "~/lib/auth.server";
import { inputClass } from "~/components/auth-ui";
import type { Route } from "./+types/forgot-password";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Forgot password — dear applicant" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getOptionalSession(request);
	if (session) throw redirect("/dashboard");
	return null;
}

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { authClient } = await import("~/lib/auth.client");
			const result = await authClient.requestPasswordReset({
				email,
				redirectTo: "/reset-password",
			});
			if (result.error) {
				setError(result.error.message ?? "Something went wrong. Please try again.");
			} else {
				setSent(true);
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	if (sent) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
				<div className="w-full max-w-sm animate-fade-in">
					<h1 className="font-serif italic text-4xl text-center text-warmgray-800 dark:text-warmgray-200 mb-10">
						dear applicant
					</h1>

					<div className="bg-white dark:bg-warmgray-900 rounded-2xl p-8 shadow-xs border border-warmgray-200/80 dark:border-warmgray-800 text-center">
						<div className="text-4xl mb-4">&#9993;</div>
						<h2 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">
							Check your email
						</h2>
						<p className="text-sm text-warmgray-600 dark:text-warmgray-400">
							If an account exists for{" "}
							<span className="font-medium text-warmgray-800 dark:text-warmgray-200">
								{email}
							</span>
							, we sent a password reset link. Check your inbox and spam
							folder.
						</p>
					</div>

					<p className="text-center text-sm text-warmgray-500 dark:text-warmgray-400 mt-6">
						<Link
							to="/login"
							className="text-teal-600 dark:text-teal-500 hover:underline font-medium"
						>
							Back to sign in
						</Link>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
			<div className="w-full max-w-sm animate-fade-in">
				<h1 className="font-serif italic text-4xl text-center text-warmgray-800 dark:text-warmgray-200 mb-10">
					dear applicant
				</h1>

				<div className="bg-white dark:bg-warmgray-900 rounded-2xl p-8 shadow-xs border border-warmgray-200/80 dark:border-warmgray-800">
					<h2 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">
						Forgot password
					</h2>
					<p className="text-sm text-warmgray-600 dark:text-warmgray-400 mb-6">
						Enter your email and we&apos;ll send you a link to reset your
						password.
					</p>

					{error && (
						<div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className={inputClass}
								placeholder="you@example.com"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer mt-2"
						>
							{loading ? "Sending\u2026" : "Send reset link"}
						</button>
					</form>
				</div>

				<p className="text-center text-sm text-warmgray-500 dark:text-warmgray-400 mt-6">
					<Link
						to="/login"
						className="text-teal-600 dark:text-teal-500 hover:underline font-medium"
					>
						Back to sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
