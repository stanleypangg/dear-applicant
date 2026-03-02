import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock functions so they're available in vi.mock factories
const { mockGetOptionalSession, mockGetRequiredSession, mockHandler } =
	vi.hoisted(() => ({
		mockGetOptionalSession: vi.fn(),
		mockGetRequiredSession: vi.fn(),
		mockHandler: vi.fn(),
	}));

// Mock auth.server utilities
vi.mock("~/lib/auth.server", () => ({
	getOptionalSession: mockGetOptionalSession,
	getRequiredSession: mockGetRequiredSession,
}));

// Mock auth handler for API route
vi.mock("~/lib/auth", () => ({
	auth: {
		handler: mockHandler,
	},
}));

// Mock React hooks used by route components (these are imported at module level)
vi.mock("react", async () => {
	const actual =
		await vi.importActual<typeof import("react")>("react");
	return {
		...actual,
		useState: vi.fn((init: unknown) => [init, vi.fn()]),
		useEffect: vi.fn(),
		useCallback: vi.fn((fn: unknown) => fn),
	};
});

// Mock react-router (provides Link, useNavigate, useSearchParams, Outlet, redirect)
vi.mock("react-router", async () => {
	const actual =
		await vi.importActual<typeof import("react-router")>("react-router");
	return {
		...actual,
		Link: vi.fn(),
		Outlet: vi.fn(),
		useNavigate: vi.fn(() => vi.fn()),
		useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
	};
});

// Mock hooks and components imported by route files
vi.mock("~/hooks/use-email-verification", () => ({
	useResendCountdown: vi.fn(() => ({
		countdown: 0,
		start: vi.fn(),
		canResend: true,
	})),
	useResendVerification: vi.fn(() => ({
		resendLoading: false,
		resendError: "",
		clearResendError: vi.fn(),
		handleResend: vi.fn(),
	})),
}));

vi.mock("~/components/auth-ui", () => ({
	GoogleIcon: vi.fn(),
	MicrosoftIcon: vi.fn(),
	inputClass: "",
	socialBtnClass: "",
}));

// Import loaders after mocks are set up
import { loader as loginLoader } from "~/routes/login";
import { loader as signupLoader } from "~/routes/signup";
import { loader as forgotPasswordLoader } from "~/routes/forgot-password";
import { loader as resetPasswordLoader } from "~/routes/reset-password";
import { loader as authLayoutLoader } from "~/routes/layout.auth";
import {
	loader as apiAuthLoader,
	action as apiAuthAction,
} from "~/routes/api.auth.$";

const fakeSession = {
	user: {
		id: "user-1",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	session: {
		id: "session-1",
		userId: "user-1",
		token: "token-abc",
		expiresAt: new Date(Date.now() + 86400000),
	},
};

function makeLoaderArgs(url: string) {
	return {
		request: new Request(url),
		params: {},
		context: {} as any,
	};
}

describe("public auth route loaders", () => {
	beforeEach(() => {
		mockGetOptionalSession.mockReset();
	});

	describe("login loader", () => {
		it("returns null when no session", async () => {
			mockGetOptionalSession.mockResolvedValue(null);
			const result = await loginLoader(
				makeLoaderArgs("http://localhost/login") as any,
			);
			expect(result).toBeNull();
		});

		it("redirects to /dashboard when authenticated", async () => {
			mockGetOptionalSession.mockResolvedValue(fakeSession);
			try {
				await loginLoader(
					makeLoaderArgs("http://localhost/login") as any,
				);
				expect.fail("should have thrown redirect");
			} catch (e) {
				const response = e as Response;
				expect(response).toBeInstanceOf(Response);
				expect(response.headers.get("Location")).toBe("/dashboard");
			}
		});
	});

	describe("signup loader", () => {
		it("returns null when no session", async () => {
			mockGetOptionalSession.mockResolvedValue(null);
			const result = await signupLoader(
				makeLoaderArgs("http://localhost/signup") as any,
			);
			expect(result).toBeNull();
		});

		it("redirects to /dashboard when authenticated", async () => {
			mockGetOptionalSession.mockResolvedValue(fakeSession);
			try {
				await signupLoader(
					makeLoaderArgs("http://localhost/signup") as any,
				);
				expect.fail("should have thrown redirect");
			} catch (e) {
				const response = e as Response;
				expect(response).toBeInstanceOf(Response);
				expect(response.headers.get("Location")).toBe("/dashboard");
			}
		});
	});

	describe("forgot-password loader", () => {
		it("returns null when no session", async () => {
			mockGetOptionalSession.mockResolvedValue(null);
			const result = await forgotPasswordLoader(
				makeLoaderArgs("http://localhost/forgot-password") as any,
			);
			expect(result).toBeNull();
		});

		it("redirects to /dashboard when authenticated", async () => {
			mockGetOptionalSession.mockResolvedValue(fakeSession);
			try {
				await forgotPasswordLoader(
					makeLoaderArgs("http://localhost/forgot-password") as any,
				);
				expect.fail("should have thrown redirect");
			} catch (e) {
				const response = e as Response;
				expect(response).toBeInstanceOf(Response);
				expect(response.headers.get("Location")).toBe("/dashboard");
			}
		});
	});

	describe("reset-password loader", () => {
		it("returns null when no session", async () => {
			mockGetOptionalSession.mockResolvedValue(null);
			const result = await resetPasswordLoader(
				makeLoaderArgs("http://localhost/reset-password") as any,
			);
			expect(result).toBeNull();
		});

		it("redirects to /dashboard when authenticated", async () => {
			mockGetOptionalSession.mockResolvedValue(fakeSession);
			try {
				await resetPasswordLoader(
					makeLoaderArgs("http://localhost/reset-password") as any,
				);
				expect.fail("should have thrown redirect");
			} catch (e) {
				const response = e as Response;
				expect(response).toBeInstanceOf(Response);
				expect(response.headers.get("Location")).toBe("/dashboard");
			}
		});
	});
});

describe("layout.auth loader", () => {
	beforeEach(() => {
		mockGetRequiredSession.mockReset();
	});

	it("returns user data when authenticated", async () => {
		mockGetRequiredSession.mockResolvedValue(fakeSession);
		const result = await authLayoutLoader(
			makeLoaderArgs("http://localhost/dashboard") as any,
		);
		expect(result).toEqual({ user: fakeSession.user });
	});

	it("propagates redirect when no session", async () => {
		const redirectResponse = new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		});
		mockGetRequiredSession.mockRejectedValue(redirectResponse);

		try {
			await authLayoutLoader(
				makeLoaderArgs("http://localhost/dashboard") as any,
			);
			expect.fail("should have thrown redirect");
		} catch (e) {
			const response = e as Response;
			expect(response).toBeInstanceOf(Response);
			expect(response.headers.get("Location")).toBe("/login");
		}
	});
});

describe("api.auth.$ route", () => {
	beforeEach(() => {
		mockHandler.mockReset();
	});

	it("loader delegates to auth.handler", async () => {
		const fakeResponse = new Response("ok");
		mockHandler.mockResolvedValue(fakeResponse);
		const args = makeLoaderArgs("http://localhost/api/auth/session");

		const result = await apiAuthLoader(args as any);

		expect(mockHandler).toHaveBeenCalledWith(args.request);
		expect(result).toBe(fakeResponse);
	});

	it("action delegates to auth.handler", async () => {
		const fakeResponse = new Response("ok");
		mockHandler.mockResolvedValue(fakeResponse);
		const request = new Request("http://localhost/api/auth/sign-in", {
			method: "POST",
		});

		const result = await apiAuthAction({
			request,
			params: {},
			context: {} as any,
		} as any);

		expect(mockHandler).toHaveBeenCalledWith(request);
		expect(result).toBe(fakeResponse);
	});
});
