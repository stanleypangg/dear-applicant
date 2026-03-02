import { useState } from "react";
import { redirect, Link, useSearchParams } from "react-router";
import { getOptionalSession } from "~/lib/auth.server";
import { inputClass } from "~/components/auth-ui";
import type { Route } from "./+types/reset-password";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Reset password — dear applicant" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getOptionalSession(request);
	if (session) throw redirect("/dashboard");
	return null;
}

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const { authClient } = await import("~/lib/auth.client");
			const result = await authClient.resetPassword({
				newPassword,
				token: token!,
			});
			if (result.error) {
				setError(result.error.message ?? "Password reset failed");
			} else {
				setSuccess(true);
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
				<div className="w-full max-w-sm animate-fade-in">
					<h1 className="font-serif italic text-4xl text-center text-warmgray-800 dark:text-warmgray-200 mb-10">
						dear applicant
					</h1>

					<div className="bg-white dark:bg-warmgray-900 rounded-2xl p-8 shadow-xs border border-warmgray-200/80 dark:border-warmgray-800 text-center">
						<h2 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">
							Password reset
						</h2>
						<p className="text-sm text-warmgray-600 dark:text-warmgray-400 mb-6">
							Your password has been updated. You can now sign in with your
							new password.
						</p>
						<Link
							to="/login"
							className="inline-block w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors text-center"
						>
							Sign in
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
				<div className="w-full max-w-sm animate-fade-in">
					<h1 className="font-serif italic text-4xl text-center text-warmgray-800 dark:text-warmgray-200 mb-10">
						dear applicant
					</h1>

					<div className="bg-white dark:bg-warmgray-900 rounded-2xl p-8 shadow-xs border border-warmgray-200/80 dark:border-warmgray-800 text-center">
						<h2 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-2">
							Invalid reset link
						</h2>
						<p className="text-sm text-warmgray-600 dark:text-warmgray-400 mb-6">
							This password reset link is invalid or has expired. Please
							request a new one.
						</p>
						<Link
							to="/forgot-password"
							className="inline-block w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors text-center"
						>
							Request new link
						</Link>
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
					<h2 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-6">
						Reset password
					</h2>

					{error && (
						<div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="new-password"
								className="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5"
							>
								New password
							</label>
							<input
								id="new-password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								minLength={8}
								autoComplete="new-password"
								className={inputClass}
							/>
						</div>

						<div>
							<label
								htmlFor="confirm-password"
								className="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5"
							>
								Confirm password
							</label>
							<input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								minLength={8}
								autoComplete="new-password"
								className={inputClass}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer mt-2"
						>
							{loading ? "Resetting\u2026" : "Reset password"}
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
