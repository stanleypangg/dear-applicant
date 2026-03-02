import { useState } from "react";
import { redirect, Link } from "react-router";
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
import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Create account — dear applicant" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getOptionalSession(request);
	if (session) throw redirect("/dashboard");
	return null;
}

export default function Signup() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [signedUp, setSignedUp] = useState(false);
	const { countdown, start: startCountdown, canResend } = useResendCountdown(60);
	const {
		resendLoading,
		resendError,
		handleResend: doResend,
	} = useResendVerification(email, startCountdown);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const { signUp } = await import("~/lib/auth.client");
			const result = await signUp.email({
				name,
				email,
				password,
				callbackURL: "/dashboard",
			});
			if (result.error) {
				if (result.error.status === 422) {
					setError("exists");
				} else {
					setError(result.error.message ?? "Sign up failed");
				}
			} else {
				setSignedUp(true);
				startCountdown();
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

	if (signedUp) {
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
						<p className="text-sm text-warmgray-600 dark:text-warmgray-400 mb-6">
							We sent a verification link to{" "}
							<span className="font-medium text-warmgray-800 dark:text-warmgray-200">
								{email}
							</span>
							. Click the link to activate your account.
						</p>

						{(error || resendError) && (
							<div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
								{error || resendError}
							</div>
						)}

						<button
							type="button"
							onClick={handleResend}
							disabled={!canResend || resendLoading}
							className="w-full rounded-lg bg-warmgray-100 dark:bg-warmgray-800 hover:bg-warmgray-200 dark:hover:bg-warmgray-700 text-warmgray-700 dark:text-warmgray-300 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
						>
							{resendLoading
								? "Sending..."
								: canResend
									? "Resend verification email"
									: `Resend in ${countdown}s`}
						</button>
					</div>

					<p className="text-center text-sm text-warmgray-500 dark:text-warmgray-400 mt-6">
						Already verified?{" "}
						<Link
							to="/login"
							className="text-teal-600 dark:text-teal-500 hover:underline font-medium"
						>
							Sign in
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
						Create account
					</h2>

					{error && (
						<div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm">
							{error === "exists" ? (
								<>
									An account with this email already exists.{" "}
									<Link
										to="/login"
										className="font-medium underline hover:text-red-700 dark:hover:text-red-300"
									>
										Sign in instead
									</Link>
								</>
							) : (
								error
							)}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1.5"
							>
								Name
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className={inputClass}
								placeholder="Your name"
							/>
						</div>

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
								minLength={8}
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
								className={inputClass}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer mt-2"
						>
							{loading ? "Creating account\u2026" : "Create account"}
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
					Already have an account?{" "}
					<Link
						to="/login"
						className="text-teal-600 dark:text-teal-500 hover:underline font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
