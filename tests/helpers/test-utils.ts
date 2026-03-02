import { eq, asc } from "drizzle-orm";
import { user } from "~/db/auth-schema";
import {
	boardColumn,
	application,
	contact,
	columnTransition,
} from "~/db/schema";
import type { TestDatabase } from "./test-db";

export const TEST_USER_ID = "test-user-001";
export const OTHER_USER_ID = "test-user-002";

// --- Seed helpers ---

export function seedUser(
	db: TestDatabase,
	overrides: Partial<{ id: string; name: string; email: string }> = {},
) {
	const now = new Date();
	const id = overrides.id ?? TEST_USER_ID;
	db.insert(user)
		.values({
			id,
			name: overrides.name ?? "Test User",
			email: overrides.email ?? `${id}@test.com`,
			emailVerified: 1,
			createdAt: now,
			updatedAt: now,
		})
		.run();
	return id;
}

export function seedColumn(
	db: TestDatabase,
	userId: string,
	overrides: Partial<{
		id: string;
		name: string;
		color: string;
		position: number;
	}> = {},
) {
	const now = new Date();
	const id = overrides.id ?? crypto.randomUUID();
	db.insert(boardColumn)
		.values({
			id,
			userId,
			name: overrides.name ?? "Test Column",
			color: overrides.color ?? "blue",
			position: overrides.position ?? 0,
			createdAt: now,
			updatedAt: now,
		})
		.run();
	return id;
}

export function seedApplication(
	db: TestDatabase,
	userId: string,
	columnId: string,
	overrides: Partial<{
		id: string;
		company: string;
		role: string;
		position: number;
		url: string | null;
		salaryMin: number | null;
		salaryMax: number | null;
		salaryCurrency: string;
		notes: string | null;
		dateApplied: Date | null;
	}> = {},
) {
	const now = new Date();
	const id = overrides.id ?? crypto.randomUUID();
	db.insert(application)
		.values({
			id,
			userId,
			columnId,
			company: overrides.company ?? "Acme Corp",
			role: overrides.role ?? "Engineer",
			position: overrides.position ?? 0,
			url: overrides.url ?? null,
			salaryMin: overrides.salaryMin ?? null,
			salaryMax: overrides.salaryMax ?? null,
			salaryCurrency: overrides.salaryCurrency ?? "USD",
			notes: overrides.notes ?? null,
			dateApplied: overrides.dateApplied ?? null,
			createdAt: now,
			updatedAt: now,
		})
		.run();
	return id;
}

export function seedContact(
	db: TestDatabase,
	applicationId: string,
	overrides: Partial<{ id: string; name: string }> = {},
) {
	const id = overrides.id ?? crypto.randomUUID();
	db.insert(contact)
		.values({
			id,
			applicationId,
			name: overrides.name ?? "John Doe",
			createdAt: new Date(),
		})
		.run();
	return id;
}

export function seedTransition(
	db: TestDatabase,
	applicationId: string,
	fromColumnId: string | null,
	toColumnId: string,
) {
	const id = crypto.randomUUID();
	db.insert(columnTransition)
		.values({
			id,
			applicationId,
			fromColumnId,
			toColumnId,
			transitionedAt: new Date(),
		})
		.run();
	return id;
}

// --- Request helpers ---

export function makeFormData(entries: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		fd.append(key, value);
	}
	return fd;
}

export function makeActionRequest(formData: FormData): Request {
	return new Request("http://localhost/test", {
		method: "POST",
		body: formData,
	});
}

export function makeLoaderRequest(): Request {
	return new Request("http://localhost/dashboard");
}

// --- Response helpers ---

export function extractData(result: any): { body: any; status: number } {
	// react-router's data() returns a DataWithResponseInit with .data and .init
	if (result && typeof result === "object" && "data" in result) {
		const status =
			typeof result.init === "number"
				? result.init
				: (result.init?.status ?? 200);
		return { body: result.data, status };
	}
	return { body: result, status: 200 };
}

// --- Query helpers ---

export function getColumns(db: TestDatabase, userId: string) {
	return db
		.select()
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId))
		.orderBy(asc(boardColumn.position))
		.all();
}

export function getApplications(db: TestDatabase, columnId: string) {
	return db
		.select()
		.from(application)
		.where(eq(application.columnId, columnId))
		.orderBy(asc(application.position))
		.all();
}

export function getAllApplications(db: TestDatabase, userId: string) {
	return db
		.select()
		.from(application)
		.where(eq(application.userId, userId))
		.orderBy(asc(application.position))
		.all();
}

export function getTransitions(db: TestDatabase, applicationId: string) {
	return db
		.select()
		.from(columnTransition)
		.where(eq(columnTransition.applicationId, applicationId))
		.all();
}

export function getContacts(db: TestDatabase, applicationId: string) {
	return db
		.select()
		.from(contact)
		.where(eq(contact.applicationId, applicationId))
		.all();
}

export function getApplicationById(db: TestDatabase, id: string) {
	return db
		.select()
		.from(application)
		.where(eq(application.id, id))
		.get();
}
