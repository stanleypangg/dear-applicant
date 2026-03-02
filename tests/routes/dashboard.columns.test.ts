import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq, asc } from "drizzle-orm";
import { createTestDb, type TestDatabase } from "../helpers/test-db";
import {
	TEST_USER_ID,
	OTHER_USER_ID,
	seedUser,
	seedColumn,
	seedApplication,
	makeFormData,
	makeActionRequest,
	extractData,
	getColumns,
	getApplications,
} from "../helpers/test-utils";
import { boardColumn } from "~/db/schema";

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

import { action } from "~/routes/dashboard.columns";

// --- Helpers ---

let db: TestDatabase;

async function callAction(entries: Record<string, string>) {
	const fd = makeFormData(entries);
	const request = makeActionRequest(fd);
	const result = await action({ request } as any);
	return extractData(result);
}

beforeEach(() => {
	db = createTestDb();
	testDbRef.current = db;
	seedUser(db);
	seedUser(db, { id: OTHER_USER_ID, email: "other@test.com" });
	mockGetRequiredSession.mockResolvedValue({
		user: { id: TEST_USER_ID },
		session: { id: "test-session" },
	});
});

// =====================================================================
// INTENT: create
// =====================================================================

describe("create column", () => {
	it("creates a column with name and color", async () => {
		const { body, status } = await callAction({
			intent: "create",
			name: "Interview",
			color: "amber",
		});

		expect(status).toBe(201);
		expect(body.id).toBeDefined();

		const cols = getColumns(db, TEST_USER_ID);
		expect(cols).toHaveLength(1);
		expect(cols[0].name).toBe("Interview");
		expect(cols[0].color).toBe("amber");
	});

	it("sets position based on existing column count", async () => {
		seedColumn(db, TEST_USER_ID, { position: 0 });
		seedColumn(db, TEST_USER_ID, { position: 1 });

		const { body } = await callAction({
			intent: "create",
			name: "Third",
			color: "green",
		});

		const cols = getColumns(db, TEST_USER_ID);
		const created = cols.find((c) => c.id === body.id);
		expect(created!.position).toBe(2);
	});

	it("returns the created column id", async () => {
		const { body } = await callAction({
			intent: "create",
			name: "Test",
			color: "blue",
		});

		expect(typeof body.id).toBe("string");
		expect(body.id.length).toBeGreaterThan(0);
	});

	it("returns 400 when name is missing", async () => {
		const { status, body } = await callAction({
			intent: "create",
			color: "blue",
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/name/i);
	});

	it("returns 400 when name is empty", async () => {
		const { status } = await callAction({
			intent: "create",
			name: "   ",
			color: "blue",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when color is missing", async () => {
		const { status, body } = await callAction({
			intent: "create",
			name: "Applied",
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/color/i);
	});

	it("returns 400 when color is empty", async () => {
		const { status } = await callAction({
			intent: "create",
			name: "Applied",
			color: "  ",
		});
		expect(status).toBe(400);
	});

	it("trims whitespace from name and color", async () => {
		const { body } = await callAction({
			intent: "create",
			name: "  Applied  ",
			color: "  blue  ",
		});

		const cols = getColumns(db, TEST_USER_ID);
		const created = cols.find((c) => c.id === body.id);
		expect(created!.name).toBe("Applied");
		expect(created!.color).toBe("blue");
	});
});

// =====================================================================
// INTENT: update
// =====================================================================

describe("update column", () => {
	let colId: string;

	beforeEach(() => {
		colId = seedColumn(db, TEST_USER_ID, {
			name: "Original",
			color: "red",
			position: 0,
		});
	});

	it("updates column name", async () => {
		const { status } = await callAction({
			intent: "update",
			columnId: colId,
			name: "Updated Name",
		});

		expect(status).toBe(200);
		const cols = getColumns(db, TEST_USER_ID);
		expect(cols[0].name).toBe("Updated Name");
	});

	it("updates column color", async () => {
		await callAction({
			intent: "update",
			columnId: colId,
			color: "green",
		});

		const cols = getColumns(db, TEST_USER_ID);
		expect(cols[0].color).toBe("green");
	});

	it("returns 400 when columnId is missing", async () => {
		const { status } = await callAction({
			intent: "update",
			name: "New",
		});
		expect(status).toBe(400);
	});

	it("returns 404 when column belongs to another user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "update",
			columnId: otherCol,
			name: "Hacked",
		});
		expect(status).toBe(404);
	});

	it("returns 400 when name is empty", async () => {
		const { status } = await callAction({
			intent: "update",
			columnId: colId,
			name: "  ",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when color is empty", async () => {
		const { status } = await callAction({
			intent: "update",
			columnId: colId,
			color: "",
		});
		expect(status).toBe(400);
	});
});

// =====================================================================
// INTENT: delete
// =====================================================================

describe("delete column", () => {
	it("deletes an empty column", async () => {
		const colId = seedColumn(db, TEST_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "delete",
			columnId: colId,
		});

		expect(status).toBe(200);
		expect(getColumns(db, TEST_USER_ID)).toHaveLength(0);
	});

	it("deletes column with apps and moves them to destination", async () => {
		const source = seedColumn(db, TEST_USER_ID, {
			name: "Source",
			position: 0,
		});
		const dest = seedColumn(db, TEST_USER_ID, {
			name: "Dest",
			position: 1,
		});
		seedApplication(db, TEST_USER_ID, source, {
			company: "Moved1",
			position: 0,
		});
		seedApplication(db, TEST_USER_ID, source, {
			company: "Moved2",
			position: 1,
		});

		const { status } = await callAction({
			intent: "delete",
			columnId: source,
			destinationColumnId: dest,
		});

		expect(status).toBe(200);
		const destApps = getApplications(db, dest);
		expect(destApps).toHaveLength(2);
		expect(destApps.map((a) => a.company)).toEqual(["Moved1", "Moved2"]);
	});

	it("sets correct positions for moved apps in destination", async () => {
		const source = seedColumn(db, TEST_USER_ID, {
			name: "Source",
			position: 0,
		});
		const dest = seedColumn(db, TEST_USER_ID, {
			name: "Dest",
			position: 1,
		});

		// Existing apps in destination
		seedApplication(db, TEST_USER_ID, dest, {
			company: "ExistingDest",
			position: 0,
		});

		// Apps in source to be moved
		seedApplication(db, TEST_USER_ID, source, {
			company: "Moved1",
			position: 0,
		});
		seedApplication(db, TEST_USER_ID, source, {
			company: "Moved2",
			position: 1,
		});

		await callAction({
			intent: "delete",
			columnId: source,
			destinationColumnId: dest,
		});

		const destApps = getApplications(db, dest);
		expect(destApps).toHaveLength(3);
		expect(destApps[0].company).toBe("ExistingDest");
		expect(destApps[0].position).toBe(0);
		expect(destApps[1].company).toBe("Moved1");
		expect(destApps[1].position).toBe(1);
		expect(destApps[2].company).toBe("Moved2");
		expect(destApps[2].position).toBe(2);
	});

	it("rewrites positions for remaining columns", async () => {
		const col1 = seedColumn(db, TEST_USER_ID, {
			name: "First",
			position: 0,
		});
		const col2 = seedColumn(db, TEST_USER_ID, {
			name: "Second",
			position: 1,
		});
		const col3 = seedColumn(db, TEST_USER_ID, {
			name: "Third",
			position: 2,
		});

		// Delete the middle column
		await callAction({ intent: "delete", columnId: col2 });

		const cols = getColumns(db, TEST_USER_ID);
		expect(cols).toHaveLength(2);
		expect(cols[0].name).toBe("First");
		expect(cols[0].position).toBe(0);
		expect(cols[1].name).toBe("Third");
		expect(cols[1].position).toBe(1);
	});

	it("returns 400 when columnId is missing", async () => {
		const { status } = await callAction({ intent: "delete" });
		expect(status).toBe(400);
	});

	it("returns 404 when column belongs to another user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "delete",
			columnId: otherCol,
		});
		expect(status).toBe(404);
	});

	it("returns 400 when column has apps but no destinationColumnId", async () => {
		const colId = seedColumn(db, TEST_USER_ID, { position: 0 });
		seedApplication(db, TEST_USER_ID, colId, { position: 0 });

		const { status, body } = await callAction({
			intent: "delete",
			columnId: colId,
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/destination/i);
	});

	it("returns 404 when destination column belongs to another user", async () => {
		const source = seedColumn(db, TEST_USER_ID, { position: 0 });
		seedApplication(db, TEST_USER_ID, source, { position: 0 });
		const otherDest = seedColumn(db, OTHER_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "delete",
			columnId: source,
			destinationColumnId: otherDest,
		});
		expect(status).toBe(404);
	});
});

// =====================================================================
// INTENT: reorder
// =====================================================================

describe("reorder columns", () => {
	it("reorders column to new position", async () => {
		const col1 = seedColumn(db, TEST_USER_ID, {
			name: "First",
			position: 0,
		});
		const col2 = seedColumn(db, TEST_USER_ID, {
			name: "Second",
			position: 1,
		});
		const col3 = seedColumn(db, TEST_USER_ID, {
			name: "Third",
			position: 2,
		});

		// Move first to last
		const { status } = await callAction({
			intent: "reorder",
			columnId: col1,
			newPosition: "2",
		});

		expect(status).toBe(200);
		const cols = getColumns(db, TEST_USER_ID);
		expect(cols.map((c) => c.name)).toEqual(["Second", "Third", "First"]);
		expect(cols.map((c) => c.position)).toEqual([0, 1, 2]);
	});

	it("clamps position to valid range", async () => {
		const col1 = seedColumn(db, TEST_USER_ID, {
			name: "First",
			position: 0,
		});
		const col2 = seedColumn(db, TEST_USER_ID, {
			name: "Second",
			position: 1,
		});

		await callAction({
			intent: "reorder",
			columnId: col1,
			newPosition: "999",
		});

		const cols = getColumns(db, TEST_USER_ID);
		expect(cols[0].name).toBe("Second");
		expect(cols[1].name).toBe("First");
	});

	it("handles moving to same position (no-op)", async () => {
		const col1 = seedColumn(db, TEST_USER_ID, {
			name: "First",
			position: 0,
		});
		const col2 = seedColumn(db, TEST_USER_ID, {
			name: "Second",
			position: 1,
		});

		await callAction({
			intent: "reorder",
			columnId: col1,
			newPosition: "0",
		});

		const cols = getColumns(db, TEST_USER_ID);
		expect(cols.map((c) => c.name)).toEqual(["First", "Second"]);
	});

	it("returns 400 when columnId is missing", async () => {
		const { status } = await callAction({
			intent: "reorder",
			newPosition: "0",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when newPosition is not a non-negative integer", async () => {
		const colId = seedColumn(db, TEST_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "reorder",
			columnId: colId,
			newPosition: "abc",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when newPosition is negative", async () => {
		const colId = seedColumn(db, TEST_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "reorder",
			columnId: colId,
			newPosition: "-1",
		});
		expect(status).toBe(400);
	});

	it("returns 404 when column does not belong to user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "reorder",
			columnId: otherCol,
			newPosition: "0",
		});
		expect(status).toBe(404);
	});
});

// =====================================================================
// Unknown intent
// =====================================================================

describe("unknown intent", () => {
	it("returns 400 for unknown intent", async () => {
		const { status, body } = await callAction({ intent: "bogus" });
		expect(status).toBe(400);
		expect(body.error).toMatch(/unknown/i);
	});
});
