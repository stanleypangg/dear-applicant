import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { inputClass } from "~/components/auth-ui";
import type { Route } from "./+types/reset-password";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Reset password — dear applicant" }];
}

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
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
			<div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-gray-950 px-4">
				<div className="w-full max-w-sm animate-fade-in">
					<h1 className="font-serif italic text-4xl text-center text-stone-800 dark:text-stone-200 mb-10">
						dear applicant
					</h1>

					<div className="bg-white dark:bg-stone-900 rounded-2xl p-8 shadow-xs border border-stone-200/80 dark:border-stone-800 text-center">
						<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
							Password reset
						</h2>
						<p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
							Your password has been updated. You can now sign in with your
							new password.
						</p>
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2.5 text-sm font-medium transition-colors cursor-pointer"
						>
							Sign in
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-gray-950 px-4">
				<div className="w-full max-w-sm animate-fade-in">
					<h1 className="font-serif italic text-4xl text-center text-stone-800 dark:text-stone-200 mb-10">
						dear applicant
					</h1>

					<div className="bg-white dark:bg-stone-900 rounded-2xl p-8 shadow-xs border border-stone-200/80 dark:border-stone-800 text-center">
						<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
							Invalid reset link
						</h2>
						<p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
							This password reset link is invalid or has expired. Please
							request a new one.
						</p>
						<Link
							to="/forgot-password"
							className="inline-block w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2.5 text-sm font-medium transition-colors text-center"
						>
							Request new link
						</Link>
					</div>

					<p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
						<Link
							to="/login"
							className="text-emerald-600 dark:text-emerald-500 hover:underline font-medium"
						>
							Back to sign in
						</Link>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-gray-950 px-4">
			<div className="w-full max-w-sm animate-fade-in">
				<h1 className="font-serif italic text-4xl text-center text-stone-800 dark:text-stone-200 mb-10">
					dear applicant
				</h1>

				<div className="bg-white dark:bg-stone-900 rounded-2xl p-8 shadow-xs border border-stone-200/80 dark:border-stone-800">
					<h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-6">
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
								className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
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
								className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
							>
								Confirm password
							</label>
							<input
								id="confirm-password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								autoComplete="new-password"
								className={inputClass}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer mt-2"
						>
							{loading ? "Resetting\u2026" : "Reset password"}
						</button>
					</form>
				</div>

				<p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
					<Link
						to="/login"
						className="text-emerald-600 dark:text-emerald-500 hover:underline font-medium"
					>
						Back to sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
