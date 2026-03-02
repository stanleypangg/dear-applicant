import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, type TestDatabase } from "../helpers/test-db";
import {
	TEST_USER_ID,
	OTHER_USER_ID,
	seedUser,
	seedColumn,
	seedApplication,
	makeLoaderRequest,
	extractData,
	getColumns,
} from "../helpers/test-utils";

// --- Mocks ---

const { mockGetRequiredSession, testDbRef } = vi.hoisted(() => ({
	mockGetRequiredSession: vi.fn(),
	testDbRef: { current: null as any },
}));

vi.mock("~/db", () => ({
	get db() {
		return testDbRef.current;
	},
}));

vi.mock("~/lib/auth.server", () => ({
	getRequiredSession: mockGetRequiredSession,
}));

import { loader } from "~/routes/dashboard";

// --- Tests ---

let db: TestDatabase;

beforeEach(() => {
	db = createTestDb();
	testDbRef.current = db;
	seedUser(db);
	mockGetRequiredSession.mockResolvedValue({
		user: { id: TEST_USER_ID },
		session: { id: "test-session" },
	});
});

describe("dashboard loader", () => {
	it("auto-seeds 4 default columns for a new user", async () => {
		const result = await loader({ request: makeLoaderRequest() } as any);
		const { body } = extractData(result);

		expect(body.columns).toHaveLength(4);
		expect(body.columns.map((c: any) => c.name)).toEqual([
			"Bookmarked",
			"Applied",
			"Interview",
			"Offer",
		]);
		expect(body.columns.map((c: any) => c.color)).toEqual([
			"indigo",
			"blue",
			"amber",
			"green",
		]);
		expect(body.columns.map((c: any) => c.position)).toEqual([0, 1, 2, 3]);
	});

	it("does not re-seed if user already has columns", async () => {
		seedColumn(db, TEST_USER_ID, {
			name: "Custom Column",
			color: "red",
			position: 0,
		});

		const result = await loader({ request: makeLoaderRequest() } as any);
		const { body } = extractData(result);

		expect(body.columns).toHaveLength(1);
		expect(body.columns[0].name).toBe("Custom Column");
	});

	it("returns columns ordered by position", async () => {
		seedColumn(db, TEST_USER_ID, { name: "Third", position: 2 });
		seedColumn(db, TEST_USER_ID, { name: "First", position: 0 });
		seedColumn(db, TEST_USER_ID, { name: "Second", position: 1 });

		const result = await loader({ request: makeLoaderRequest() } as any);
		const { body } = extractData(result);

		expect(body.columns.map((c: any) => c.name)).toEqual([
			"First",
			"Second",
			"Third",
		]);
	});

	it("returns applications grouped by column", async () => {
		const colA = seedColumn(db, TEST_USER_ID, {
			name: "Col A",
			position: 0,
		});
		const colB = seedColumn(db, TEST_USER_ID, {
			name: "Col B",
			position: 1,
		});
		seedApplication(db, TEST_USER_ID, colA, {
			company: "Google",
			position: 0,
		});
		seedApplication(db, TEST_USER_ID, colA, {
			company: "Meta",
			position: 1,
		});
		seedApplication(db, TEST_USER_ID, colB, {
			company: "Apple",
			position: 0,
		});

		const result = await loader({ request: makeLoaderRequest() } as any);
		const { body } = extractData(result);

		const colAData = body.columns.find((c: any) => c.name === "Col A");
		const colBData = body.columns.find((c: any) => c.name === "Col B");
		expect(colAData.applications).toHaveLength(2);
		expect(colBData.applications).toHaveLength(1);
		expect(colAData.applications[0].company).toBe("Google");
		expect(colBData.applications[0].company).toBe("Apple");
	});

	it("returns empty applications array for columns with no apps", async () => {
		seedColumn(db, TEST_USER_ID, { name: "Empty", position: 0 });

		const result = await loader({ request: makeLoaderRequest() } as any);
		const { body } = extractData(result);

		expect(body.columns[0].applications).toEqual([]);
	});

	it("isolates data between users", async () => {
		seedUser(db, { id: OTHER_USER_ID, email: "other@test.com" });
		seedColumn(db, TEST_USER_ID, { name: "My Column", position: 0 });
		seedColumn(db, OTHER_USER_ID, { name: "Their Column", position: 0 });

		const result = await loader({ request: makeLoaderRequest() } as any);
		const { body } = extractData(result);

		expect(body.columns).toHaveLength(1);
		expect(body.columns[0].name).toBe("My Column");
	});
});
