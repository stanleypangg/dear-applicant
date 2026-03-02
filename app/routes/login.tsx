import { useState } from "react";
import { redirect, Link, useNavigate } from "react-router";
import { getOptionalSession } from "~/lib/auth.server";
import {
	useResendCountdown,
	useResendVerification,
} from "~/hooks/use-email-verification";
import {
	GoogleIcon,
	MicrosoftIcon,
	inputClass,
	socialBtnClass,
} from "~/components/auth-ui";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Sign in — dear applicant" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getOptionalSession(request);
	if (session) throw redirect("/dashboard");
	return null;
}

export default function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [emailUnverified, setEmailUnverified] = useState(false);
	const { countdown, start: startCountdown, canResend } = useResendCountdown(60);
	const {
		resendLoading,
		resendError,
		clearResendError,
		handleResend: doResend,
	} = useResendVerification(email, startCountdown);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setEmailUnverified(false);
		clearResendError();
		setLoading(true);
		try {
			const { signIn } = await import("~/lib/auth.client");
			const result = await signIn.email({ email, password });
			if (result.error) {
				if (
					result.error.status === 403 &&
					result.error.message?.includes("Email not verified")
				) {
					setEmailUnverified(true);
				} else {
					setError(result.error.message ?? "Sign in failed");
				}
			} else {
				navigate("/dashboard");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	function handleResend() {
		if (!canResend) return;
		doResend();
	}

	async function handleSocial(provider: "google" | "microsoft") {
		setError("");
		setLoading(true);
		try {
			const { signIn } = await import("~/lib/auth.client");
			await signIn.social({ provider, callbackURL: "/dashboard" });
		} catch {
			setError(`Failed to connect to ${provider}. Please try again.`);
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-warmgray-50 dark:bg-warmgray-950 px-4">
			<div className="w-full max-w-sm animate-fade-in">
				<h1 className="font-serif italic text-4xl text-center text-warmgray-800 dark:text-warmgray-200 mb-10">
					dear applicant
				</h1>

				<div className="bg-white dark:bg-warmgray-900 rounded-2xl p-8 shadow-xs border border-warmgray-200/80 dark:border-warmgray-800">
					<h2 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100 mb-6">
						Sign in
					</h2>

					{emailUnverified && (
						<div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-sm">
							<p className="font-medium mb-1">Please verify your email first</p>
							<p className="mb-3">
								Check your inbox for a verification link, or resend it below.
							</p>
							<button
								type="button"
								onClick={handleResend}
								disabled={!canResend || resendLoading}
								className="w-full rounded-lg bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-300 py-2 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
							>
								{resendLoading
									? "Sending..."
									: canResend
										? "Resend verification email"
										: `Resend in ${countdown}s`}
							</button>
						</div>
					)}

					{(error || resendError) && (
						<div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
							{error || resendError}
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

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className={inputClass}
							/>
							<div className="mt-1.5 text-right">
								<Link
									to="/forgot-password"
									className="text-sm text-warmgray-500 dark:text-warmgray-400 hover:text-teal-600 dark:hover:text-teal-500 transition-colors"
								>
									Forgot password?
								</Link>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer mt-2"
						>
							{loading ? "Signing in\u2026" : "Sign in"}
						</button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-warmgray-200 dark:border-warmgray-700" />
						</div>
						<div className="relative flex justify-center text-xs uppercase tracking-wide">
							<span className="bg-white dark:bg-warmgray-900 px-3 text-warmgray-400">
								or
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							disabled={loading}
							onClick={() => handleSocial("google")}
							className={socialBtnClass}
						>
							<GoogleIcon />
							Google
						</button>
						<button
							type="button"
							disabled={loading}
							onClick={() => handleSocial("microsoft")}
							className={socialBtnClass}
						>
							<MicrosoftIcon />
							Microsoft
						</button>
					</div>
				</div>

				<p className="text-center text-sm text-warmgray-500 dark:text-warmgray-400 mt-6">
					Don&apos;t have an account?{" "}
					<Link
						to="/signup"
						className="text-teal-600 dark:text-teal-500 hover:underline font-medium"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
