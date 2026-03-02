import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted runs before vi.mock hoisting, so mockGetSession is available in the factory
const { mockGetSession } = vi.hoisted(() => ({
	mockGetSession: vi.fn(),
}));

// Mock the auth module — this prevents cloudflare:workers from being imported
vi.mock("~/lib/auth", () => ({
	auth: {
		api: {
			getSession: mockGetSession,
		},
	},
}));

import {
	getRequiredSession,
	getOptionalSession,
} from "~/lib/auth.server";

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
		ipAddress: "127.0.0.1",
		userAgent: "test-agent",
	},
};

describe("getRequiredSession", () => {
	beforeEach(() => {
		mockGetSession.mockReset();
	});

	it("returns session when authenticated", async () => {
		mockGetSession.mockResolvedValue(fakeSession);
		const request = new Request("http://localhost/dashboard");

		const result = await getRequiredSession(request);

		expect(result).toBe(fakeSession);
	});

	it("throws redirect to /login when no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const request = new Request("http://localhost/dashboard");

		try {
			await getRequiredSession(request);
			expect.fail("should have thrown");
		} catch (e) {
			// redirect() from react-router throws a Response
			const response = e as Response;
			expect(response).toBeInstanceOf(Response);
			expect(response.status).toBe(302);
			expect(response.headers.get("Location")).toBe("/login");
		}
	});

	it("passes request headers to auth.api.getSession", async () => {
		mockGetSession.mockResolvedValue(fakeSession);
		const headers = new Headers({ Cookie: "session=abc" });
		const request = new Request("http://localhost/dashboard", { headers });

		await getRequiredSession(request);

		expect(mockGetSession).toHaveBeenCalledWith({
			headers: request.headers,
		});
	});
});

describe("getOptionalSession", () => {
	beforeEach(() => {
		mockGetSession.mockReset();
	});

	it("returns session when authenticated", async () => {
		mockGetSession.mockResolvedValue(fakeSession);
		const request = new Request("http://localhost/login");

		const result = await getOptionalSession(request);

		expect(result).toBe(fakeSession);
	});

	it("returns null when no session", async () => {
		mockGetSession.mockResolvedValue(null);
		const request = new Request("http://localhost/login");

		const result = await getOptionalSession(request);

		expect(result).toBeNull();
	});

	it("passes request headers to auth.api.getSession", async () => {
		mockGetSession.mockResolvedValue(fakeSession);
		const headers = new Headers({ Cookie: "session=abc" });
		const request = new Request("http://localhost/login", { headers });

		await getOptionalSession(request);

		expect(mockGetSession).toHaveBeenCalledWith({
			headers: request.headers,
		});
	});
});
