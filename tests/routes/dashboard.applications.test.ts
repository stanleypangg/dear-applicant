import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, type TestDatabase } from "../helpers/test-db";
import {
	TEST_USER_ID,
	OTHER_USER_ID,
	seedUser,
	seedColumn,
	seedApplication,
	seedContact,
	seedTransition,
	makeFormData,
	makeActionRequest,
	extractData,
	getApplications,
	getTransitions,
	getContacts,
	getApplicationById,
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

import { action } from "~/routes/dashboard.applications";

// --- Helpers ---

let db: TestDatabase;
let columnId: string;

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
	columnId = seedColumn(db, TEST_USER_ID, { name: "Applied", position: 0 });
	mockGetRequiredSession.mockResolvedValue({
		user: { id: TEST_USER_ID },
		session: { id: "test-session" },
	});
});

// =====================================================================
// INTENT: create
// =====================================================================

describe("create application", () => {
	it("creates an application with required fields only", async () => {
		const { body, status } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
		});

		expect(status).toBe(201);
		expect(body.id).toBeDefined();

		const app = getApplicationById(db, body.id);
		expect(app).toBeDefined();
		expect(app!.company).toBe("Google");
		expect(app!.role).toBe("SWE");
		expect(app!.columnId).toBe(columnId);
		expect(app!.salaryCurrency).toBe("USD");
		expect(app!.url).toBeNull();
		expect(app!.notes).toBeNull();
		expect(app!.salaryMin).toBeNull();
		expect(app!.salaryMax).toBeNull();
		expect(app!.dateApplied).toBeNull();
	});

	it("creates an application with all optional fields", async () => {
		const { body, status } = await callAction({
			intent: "create",
			columnId,
			company: "Meta",
			role: "PM",
			url: "https://meta.com/jobs/123",
			dateApplied: "2026-01-15",
			salaryMin: "100000",
			salaryMax: "150000",
			salaryCurrency: "EUR",
			notes: "Referred by friend",
		});

		expect(status).toBe(201);
		const app = getApplicationById(db, body.id);
		expect(app!.url).toBe("https://meta.com/jobs/123");
		expect(app!.salaryMin).toBe(100000);
		expect(app!.salaryMax).toBe(150000);
		expect(app!.salaryCurrency).toBe("EUR");
		expect(app!.notes).toBe("Referred by friend");
		expect(app!.dateApplied).toBeInstanceOf(Date);
	});

	it("records a column transition on create", async () => {
		const { body } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
		});

		const transitions = getTransitions(db, body.id);
		expect(transitions).toHaveLength(1);
		expect(transitions[0].fromColumnId).toBeNull();
		expect(transitions[0].toColumnId).toBe(columnId);
	});

	it("assigns sequential positions", async () => {
		await callAction({
			intent: "create",
			columnId,
			company: "First",
			role: "SWE",
		});
		await callAction({
			intent: "create",
			columnId,
			company: "Second",
			role: "SWE",
		});
		await callAction({
			intent: "create",
			columnId,
			company: "Third",
			role: "SWE",
		});

		const apps = getApplications(db, columnId);
		expect(apps.map((a) => a.company)).toEqual([
			"First",
			"Second",
			"Third",
		]);
		expect(apps.map((a) => a.position)).toEqual([0, 1, 2]);
	});

	it("returns 400 when company is missing", async () => {
		const { status, body } = await callAction({
			intent: "create",
			columnId,
			role: "SWE",
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/company/i);
	});

	it("returns 400 when company is empty", async () => {
		const { status } = await callAction({
			intent: "create",
			columnId,
			company: "   ",
			role: "SWE",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when role is missing", async () => {
		const { status, body } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/role/i);
	});

	it("returns 400 when columnId is missing", async () => {
		const { status } = await callAction({
			intent: "create",
			company: "Google",
			role: "SWE",
		});
		expect(status).toBe(400);
	});

	it("returns 404 when column belongs to another user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });
		const { status } = await callAction({
			intent: "create",
			columnId: otherCol,
			company: "Google",
			role: "SWE",
		});
		expect(status).toBe(404);
	});

	it("returns 400 for invalid dateApplied", async () => {
		const { status, body } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
			dateApplied: "not-a-date",
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/dateApplied/i);
	});

	it("returns 400 for non-numeric salaryMin", async () => {
		const { status } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
			salaryMin: "abc",
		});
		expect(status).toBe(400);
	});

	it("returns 400 for non-numeric salaryMax", async () => {
		const { status } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
			salaryMax: "xyz",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when salaryMin > salaryMax", async () => {
		const { status, body } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
			salaryMin: "200000",
			salaryMax: "100000",
		});
		expect(status).toBe(400);
		expect(body.error).toMatch(/salaryMin/i);
	});

	it("trims whitespace from text fields", async () => {
		const { body } = await callAction({
			intent: "create",
			columnId,
			company: "  Google  ",
			role: "  SWE  ",
			url: "  https://google.com  ",
			notes: "  Some notes  ",
		});

		const app = getApplicationById(db, body.id);
		expect(app!.company).toBe("Google");
		expect(app!.role).toBe("SWE");
		expect(app!.url).toBe("https://google.com");
		expect(app!.notes).toBe("Some notes");
	});

	it("defaults salaryCurrency to USD", async () => {
		const { body } = await callAction({
			intent: "create",
			columnId,
			company: "Google",
			role: "SWE",
		});

		const app = getApplicationById(db, body.id);
		expect(app!.salaryCurrency).toBe("USD");
	});
});

// =====================================================================
// INTENT: update
// =====================================================================

describe("update application", () => {
	let appId: string;

	beforeEach(() => {
		appId = seedApplication(db, TEST_USER_ID, columnId, {
			company: "Original Co",
			role: "Original Role",
			url: "https://original.com",
			notes: "Original notes",
			salaryMin: 80000,
			salaryMax: 120000,
		});
	});

	it("updates company", async () => {
		const { status } = await callAction({
			intent: "update",
			applicationId: appId,
			company: "New Company",
		});

		expect(status).toBe(200);
		const app = getApplicationById(db, appId);
		expect(app!.company).toBe("New Company");
	});

	it("updates role", async () => {
		await callAction({
			intent: "update",
			applicationId: appId,
			role: "New Role",
		});

		const app = getApplicationById(db, appId);
		expect(app!.role).toBe("New Role");
	});

	it("updates multiple fields at once", async () => {
		await callAction({
			intent: "update",
			applicationId: appId,
			company: "Updated Co",
			role: "Updated Role",
			notes: "Updated notes",
		});

		const app = getApplicationById(db, appId);
		expect(app!.company).toBe("Updated Co");
		expect(app!.role).toBe("Updated Role");
		expect(app!.notes).toBe("Updated notes");
	});

	it("clears optional url field when empty", async () => {
		await callAction({
			intent: "update",
			applicationId: appId,
			url: "",
		});

		const app = getApplicationById(db, appId);
		expect(app!.url).toBeNull();
	});

	it("clears optional notes field when empty", async () => {
		await callAction({
			intent: "update",
			applicationId: appId,
			notes: "",
		});

		const app = getApplicationById(db, appId);
		expect(app!.notes).toBeNull();
	});

	it("clears optional dateApplied field when empty", async () => {
		// First set a date
		seedApplication(db, TEST_USER_ID, columnId, {
			id: "app-with-date",
			dateApplied: new Date("2026-01-01"),
			position: 1,
		});

		await callAction({
			intent: "update",
			applicationId: "app-with-date",
			dateApplied: "",
		});

		const app = getApplicationById(db, "app-with-date");
		expect(app!.dateApplied).toBeNull();
	});

	it("returns 400 when applicationId is missing", async () => {
		const { status } = await callAction({
			intent: "update",
			company: "New",
		});
		expect(status).toBe(400);
	});

	it("returns 404 when application belongs to another user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });
		const otherApp = seedApplication(db, OTHER_USER_ID, otherCol, {
			position: 0,
		});

		const { status } = await callAction({
			intent: "update",
			applicationId: otherApp,
			company: "Hacked",
		});
		expect(status).toBe(404);
	});

	it("returns 400 when company set to empty", async () => {
		const { status } = await callAction({
			intent: "update",
			applicationId: appId,
			company: "   ",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when role set to empty", async () => {
		const { status } = await callAction({
			intent: "update",
			applicationId: appId,
			role: "",
		});
		expect(status).toBe(400);
	});

	it("returns 400 for invalid dateApplied format", async () => {
		const { status } = await callAction({
			intent: "update",
			applicationId: appId,
			dateApplied: "not-a-date",
		});
		expect(status).toBe(400);
	});

	it("returns 400 for non-numeric salaryMin", async () => {
		const { status } = await callAction({
			intent: "update",
			applicationId: appId,
			salaryMin: "abc",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when updated salaryMin > salaryMax", async () => {
		const { status } = await callAction({
			intent: "update",
			applicationId: appId,
			salaryMin: "999999",
			salaryMax: "100",
		});
		expect(status).toBe(400);
	});

	it("sets updatedAt on update", async () => {
		const before = getApplicationById(db, appId)!.updatedAt;

		// Small delay to ensure timestamp differs
		await new Promise((r) => setTimeout(r, 10));

		await callAction({
			intent: "update",
			applicationId: appId,
			company: "Newer",
		});

		const after = getApplicationById(db, appId)!.updatedAt;
		expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
	});
});

// =====================================================================
// INTENT: delete
// =====================================================================

describe("delete application", () => {
	it("deletes an application", async () => {
		const appId = seedApplication(db, TEST_USER_ID, columnId, {
			position: 0,
		});

		const { status } = await callAction({
			intent: "delete",
			applicationId: appId,
		});

		expect(status).toBe(200);
		expect(getApplicationById(db, appId)).toBeUndefined();
	});

	it("rewrites positions for remaining apps in same column", async () => {
		const app1 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "First",
			position: 0,
		});
		const app2 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "Second",
			position: 1,
		});
		const app3 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "Third",
			position: 2,
		});

		// Delete the middle one
		await callAction({ intent: "delete", applicationId: app2 });

		const remaining = getApplications(db, columnId);
		expect(remaining).toHaveLength(2);
		expect(remaining[0].company).toBe("First");
		expect(remaining[0].position).toBe(0);
		expect(remaining[1].company).toBe("Third");
		expect(remaining[1].position).toBe(1);
	});

	it("returns 400 when applicationId is missing", async () => {
		const { status } = await callAction({ intent: "delete" });
		expect(status).toBe(400);
	});

	it("returns 404 when application belongs to another user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });
		const otherApp = seedApplication(db, OTHER_USER_ID, otherCol, {
			position: 0,
		});

		const { status } = await callAction({
			intent: "delete",
			applicationId: otherApp,
		});
		expect(status).toBe(404);
	});

	it("cascade deletes contacts", async () => {
		const appId = seedApplication(db, TEST_USER_ID, columnId, {
			position: 0,
		});
		seedContact(db, appId, { name: "Recruiter" });
		seedContact(db, appId, { name: "Hiring Manager" });

		expect(getContacts(db, appId)).toHaveLength(2);

		await callAction({ intent: "delete", applicationId: appId });

		expect(getContacts(db, appId)).toHaveLength(0);
	});

	it("cascade deletes column transitions", async () => {
		const appId = seedApplication(db, TEST_USER_ID, columnId, {
			position: 0,
		});
		seedTransition(db, appId, null, columnId);

		expect(getTransitions(db, appId)).toHaveLength(1);

		await callAction({ intent: "delete", applicationId: appId });

		expect(getTransitions(db, appId)).toHaveLength(0);
	});
});

// =====================================================================
// INTENT: move (cross-column)
// =====================================================================

describe("move application (cross-column)", () => {
	let colA: string;
	let colB: string;

	beforeEach(() => {
		colA = seedColumn(db, TEST_USER_ID, {
			name: "Source",
			position: 0,
			id: "col-a",
		});
		colB = seedColumn(db, TEST_USER_ID, {
			name: "Target",
			position: 1,
			id: "col-b",
		});
	});

	it("moves application to a different column", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });

		const { status } = await callAction({
			intent: "move",
			applicationId: appId,
			toColumnId: colB,
			newPosition: "0",
		});

		expect(status).toBe(200);
		const app = getApplicationById(db, appId);
		expect(app!.columnId).toBe(colB);
	});

	it("records a column transition on cross-column move", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });

		await callAction({
			intent: "move",
			applicationId: appId,
			toColumnId: colB,
			newPosition: "0",
		});

		const transitions = getTransitions(db, appId);
		expect(transitions).toHaveLength(1);
		expect(transitions[0].fromColumnId).toBe(colA);
		expect(transitions[0].toColumnId).toBe(colB);
	});

	it("rewrites positions in source column after move", async () => {
		const app1 = seedApplication(db, TEST_USER_ID, colA, {
			company: "Stay1",
			position: 0,
		});
		const app2 = seedApplication(db, TEST_USER_ID, colA, {
			company: "Move",
			position: 1,
		});
		const app3 = seedApplication(db, TEST_USER_ID, colA, {
			company: "Stay2",
			position: 2,
		});

		await callAction({
			intent: "move",
			applicationId: app2,
			toColumnId: colB,
			newPosition: "0",
		});

		const sourceApps = getApplications(db, colA);
		expect(sourceApps).toHaveLength(2);
		expect(sourceApps[0].company).toBe("Stay1");
		expect(sourceApps[0].position).toBe(0);
		expect(sourceApps[1].company).toBe("Stay2");
		expect(sourceApps[1].position).toBe(1);
	});

	it("inserts at correct position in target column", async () => {
		const app1 = seedApplication(db, TEST_USER_ID, colB, {
			company: "Existing1",
			position: 0,
		});
		const app2 = seedApplication(db, TEST_USER_ID, colB, {
			company: "Existing2",
			position: 1,
		});
		const movingApp = seedApplication(db, TEST_USER_ID, colA, {
			company: "Moved",
			position: 0,
		});

		// Insert at position 1 (between existing apps)
		await callAction({
			intent: "move",
			applicationId: movingApp,
			toColumnId: colB,
			newPosition: "1",
		});

		const targetApps = getApplications(db, colB);
		expect(targetApps).toHaveLength(3);
		expect(targetApps[0].company).toBe("Existing1");
		expect(targetApps[1].company).toBe("Moved");
		expect(targetApps[2].company).toBe("Existing2");
		expect(targetApps.map((a) => a.position)).toEqual([0, 1, 2]);
	});

	it("clamps position to valid range", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });

		await callAction({
			intent: "move",
			applicationId: appId,
			toColumnId: colB,
			newPosition: "999",
		});

		const targetApps = getApplications(db, colB);
		expect(targetApps).toHaveLength(1);
		expect(targetApps[0].position).toBe(0);
	});

	it("returns 400 when applicationId is missing", async () => {
		const { status } = await callAction({
			intent: "move",
			toColumnId: colB,
			newPosition: "0",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when toColumnId is missing", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });
		const { status } = await callAction({
			intent: "move",
			applicationId: appId,
			newPosition: "0",
		});
		expect(status).toBe(400);
	});

	it("returns 400 when newPosition is missing", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });
		const { status } = await callAction({
			intent: "move",
			applicationId: appId,
			toColumnId: colB,
		});
		expect(status).toBe(400);
	});

	it("returns 400 when newPosition is negative", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });
		const { status } = await callAction({
			intent: "move",
			applicationId: appId,
			toColumnId: colB,
			newPosition: "-1",
		});
		expect(status).toBe(400);
	});

	it("returns 404 when application belongs to another user", async () => {
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });
		const otherApp = seedApplication(db, OTHER_USER_ID, otherCol, {
			position: 0,
		});

		const { status } = await callAction({
			intent: "move",
			applicationId: otherApp,
			toColumnId: colB,
			newPosition: "0",
		});
		expect(status).toBe(404);
	});

	it("returns 404 when target column belongs to another user", async () => {
		const appId = seedApplication(db, TEST_USER_ID, colA, { position: 0 });
		const otherCol = seedColumn(db, OTHER_USER_ID, { position: 0 });

		const { status } = await callAction({
			intent: "move",
			applicationId: appId,
			toColumnId: otherCol,
			newPosition: "0",
		});
		expect(status).toBe(404);
	});
});

// =====================================================================
// INTENT: move (same-column reorder)
// =====================================================================

describe("move application (same-column reorder)", () => {
	it("reorders within the same column", async () => {
		const app1 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "First",
			position: 0,
		});
		const app2 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "Second",
			position: 1,
		});
		const app3 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "Third",
			position: 2,
		});

		// Move first to last
		await callAction({
			intent: "move",
			applicationId: app1,
			toColumnId: columnId,
			newPosition: "2",
		});

		const apps = getApplications(db, columnId);
		expect(apps.map((a) => a.company)).toEqual([
			"Second",
			"Third",
			"First",
		]);
		expect(apps.map((a) => a.position)).toEqual([0, 1, 2]);
	});

	it("does not record a column transition for same-column reorder", async () => {
		const app1 = seedApplication(db, TEST_USER_ID, columnId, {
			position: 0,
		});
		const app2 = seedApplication(db, TEST_USER_ID, columnId, {
			position: 1,
		});

		await callAction({
			intent: "move",
			applicationId: app1,
			toColumnId: columnId,
			newPosition: "1",
		});

		const transitions = getTransitions(db, app1);
		expect(transitions).toHaveLength(0);
	});

	it("clamps position in same-column reorder", async () => {
		const app1 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "First",
			position: 0,
		});
		const app2 = seedApplication(db, TEST_USER_ID, columnId, {
			company: "Second",
			position: 1,
		});

		// Position 999 should clamp to 1 (length - 1)
		await callAction({
			intent: "move",
			applicationId: app1,
			toColumnId: columnId,
			newPosition: "999",
		});

		const apps = getApplications(db, columnId);
		expect(apps[0].company).toBe("Second");
		expect(apps[1].company).toBe("First");
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
