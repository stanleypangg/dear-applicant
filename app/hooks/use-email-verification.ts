import { useState, useEffect, useCallback } from "react";

export function useResendCountdown(seconds: number) {
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (countdown <= 0) return;
		const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [countdown]);

	const start = useCallback(() => setCountdown(seconds), [seconds]);

	return { countdown, start, canResend: countdown <= 0 };
}

export function useResendVerification(
	email: string,
	startCountdown: () => void,
) {
	const [resendLoading, setResendLoading] = useState(false);
	const [resendError, setResendError] = useState("");

	const handleResend = useCallback(async () => {
		setResendLoading(true);
		setResendError("");
		try {
			const { authClient } = await import("~/lib/auth.client");
			const result = await authClient.sendVerificationEmail({
				email,
				callbackURL: "/dashboard",
			});
			if (result.error) {
				setResendError(result.error.message ?? "Failed to resend email");
			} else {
				startCountdown();
			}
		} catch {
			setResendError("Something went wrong. Please try again.");
		} finally {
			setResendLoading(false);
		}
	}, [email, startCountdown]);

	const clearResendError = useCallback(() => setResendError(""), []);

	return { resendLoading, resendError, clearResendError, handleResend };
}
