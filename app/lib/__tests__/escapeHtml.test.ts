import { describe, it, expect, vi } from "vitest";

// Mock cloudflare:workers before any app imports
vi.mock("cloudflare:workers", () => ({
	env: {
		RESEND_API_KEY: "test",
		BETTER_AUTH_SECRET: "test-secret",
		ORIGIN: "http://localhost:5173",
		EMAIL_FROM: "test@test.com",
	},
}));

// Mock the db module to avoid D1 initialization
vi.mock("~/db", () => ({
	db: {},
}));

// Mock resend to avoid real API calls
vi.mock("resend", () => ({
	Resend: class {
		constructor() {}
		emails = { send: vi.fn() };
	},
}));

import { escapeHtml } from "~/lib/auth";

describe("escapeHtml", () => {
	it("escapes ampersand", () => {
		expect(escapeHtml("a&b")).toBe("a&amp;b");
	});

	it("escapes less-than", () => {
		expect(escapeHtml("a<b")).toBe("a&lt;b");
	});

	it("escapes greater-than", () => {
		expect(escapeHtml("a>b")).toBe("a&gt;b");
	});

	it("escapes double quotes", () => {
		expect(escapeHtml('a"b')).toBe("a&quot;b");
	});

	it("escapes single quotes", () => {
		expect(escapeHtml("a'b")).toBe("a&#39;b");
	});

	it("escapes multiple special characters in one string", () => {
		expect(escapeHtml('<script>"alert(\'xss\')&"</script>')).toBe(
			"&lt;script&gt;&quot;alert(&#39;xss&#39;)&amp;&quot;&lt;/script&gt;"
		);
	});

	it("returns unchanged string with no special characters", () => {
		expect(escapeHtml("hello world")).toBe("hello world");
	});

	it("returns empty string unchanged", () => {
		expect(escapeHtml("")).toBe("");
	});

	it("escapes & in URL query params", () => {
		expect(escapeHtml("https://example.com?a=1&b=2&c=3")).toBe(
			"https://example.com?a=1&amp;b=2&amp;c=3"
		);
	});
});
