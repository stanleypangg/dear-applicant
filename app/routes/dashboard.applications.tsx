import type { BatchItem } from "drizzle-orm/batch";
import type { InferInsertModel } from "drizzle-orm";
import { eq, and, asc, count } from "drizzle-orm";
import { data } from "react-router";
import { db } from "~/db";
import { boardColumn, application, columnTransition } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/dashboard.applications";

export async function action({ request }: Route.ActionArgs) {
	const session = await getRequiredSession(request);
	const userId = session.user.id;
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "create":
			return handleCreate(userId, formData);
		case "update":
			return handleUpdate(userId, formData);
		case "delete":
			return handleDelete(userId, formData);
		case "move":
			return handleMove(userId, formData);
		default:
			return data({ error: "Unknown intent" }, { status: 400 });
	}
}

async function handleCreate(userId: string, formData: FormData) {
	const columnId = formData.get("columnId");
	const company = formData.get("company");
	const role = formData.get("role");

	if (typeof columnId !== "string") {
		return data({ error: "columnId is required" }, { status: 400 });
	}
	if (typeof company !== "string" || !company.trim()) {
		return data({ error: "Company is required" }, { status: 400 });
	}
	if (typeof role !== "string" || !role.trim()) {
		return data({ error: "Role is required" }, { status: 400 });
	}

	// Verify user owns the column
	const [column] = await db
		.select({ id: boardColumn.id })
		.from(boardColumn)
		.where(and(eq(boardColumn.id, columnId), eq(boardColumn.userId, userId)));

	if (!column) {
		return data({ error: "Column not found" }, { status: 404 });
	}

	// Count apps in column for position (racy if two creates hit simultaneously, but D1 batch isn't atomic anyway)
	const [{ value: position }] = await db
		.select({ value: count() })
		.from(application)
		.where(eq(application.columnId, columnId));

	// Parse optional fields
	const url = formData.get("url");
	const dateAppliedStr = formData.get("dateApplied");
	const salaryMinStr = formData.get("salaryMin");
	const salaryMaxStr = formData.get("salaryMax");
	const salaryCurrency = formData.get("salaryCurrency");
	const notes = formData.get("notes");

	let dateApplied: Date | null = null;
	if (typeof dateAppliedStr === "string" && dateAppliedStr) {
		const parsed = new Date(dateAppliedStr);
		if (isNaN(parsed.getTime())) {
			return data({ error: "Invalid dateApplied format" }, { status: 400 });
		}
		dateApplied = parsed;
	}

	let salaryMin: number | null = null;
	let salaryMax: number | null = null;
	if (typeof salaryMinStr === "string" && salaryMinStr) {
		salaryMin = parseInt(salaryMinStr);
		if (isNaN(salaryMin)) {
			return data({ error: "salaryMin must be a number" }, { status: 400 });
		}
	}
	if (typeof salaryMaxStr === "string" && salaryMaxStr) {
		salaryMax = parseInt(salaryMaxStr);
		if (isNaN(salaryMax)) {
			return data({ error: "salaryMax must be a number" }, { status: 400 });
		}
	}
	if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
		return data({ error: "salaryMin must be <= salaryMax" }, { status: 400 });
	}

	const now = new Date();
	const appId = crypto.randomUUID();

	await db.batch([
		db.insert(application).values({
			id: appId,
			userId,
			columnId,
			company: company.trim(),
			role: role.trim(),
			url: typeof url === "string" && url.trim() ? url.trim() : null,
			dateApplied,
			salaryMin,
			salaryMax,
			salaryCurrency:
				typeof salaryCurrency === "string" && salaryCurrency.trim()
					? salaryCurrency.trim()
					: "USD",
			notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
			position,
			createdAt: now,
			updatedAt: now,
		}),
		db.insert(columnTransition).values({
			applicationId: appId,
			fromColumnId: null,
			toColumnId: columnId,
			transitionedAt: now,
		}),
	]);

	return data({ id: appId }, { status: 201 });
}

async function handleUpdate(userId: string, formData: FormData) {
	const applicationId = formData.get("applicationId");
	if (typeof applicationId !== "string") {
		return data({ error: "applicationId is required" }, { status: 400 });
	}

	// Verify ownership and fetch current salary values for cross-validation
	const [app] = await db
		.select({
			id: application.id,
			salaryMin: application.salaryMin,
			salaryMax: application.salaryMax,
		})
		.from(application)
		.where(
			and(eq(application.id, applicationId), eq(application.userId, userId)),
		);

	if (!app) {
		return data({ error: "Application not found" }, { status: 404 });
	}

	const updates: Partial<InferInsertModel<typeof application>> = { updatedAt: new Date() };

	if (formData.has("company")) {
		const company = formData.get("company");
		if (typeof company !== "string" || !company.trim()) {
			return data({ error: "Company cannot be empty" }, { status: 400 });
		}
		updates.company = company.trim();
	}
	if (formData.has("role")) {
		const role = formData.get("role");
		if (typeof role !== "string" || !role.trim()) {
			return data({ error: "Role cannot be empty" }, { status: 400 });
		}
		updates.role = role.trim();
	}
	if (formData.has("url")) {
		const url = formData.get("url");
		updates.url = typeof url === "string" && url.trim() ? url.trim() : null;
	}
	if (formData.has("dateApplied")) {
		const dateAppliedStr = formData.get("dateApplied");
		if (typeof dateAppliedStr === "string" && dateAppliedStr) {
			const parsed = new Date(dateAppliedStr);
			if (isNaN(parsed.getTime())) {
				return data({ error: "Invalid dateApplied format" }, { status: 400 });
			}
			updates.dateApplied = parsed;
		} else {
			updates.dateApplied = null;
		}
	}
	if (formData.has("salaryMin")) {
		const v = formData.get("salaryMin");
		if (typeof v === "string" && v) {
			const parsed = parseInt(v);
			if (isNaN(parsed)) {
				return data({ error: "salaryMin must be a number" }, { status: 400 });
			}
			updates.salaryMin = parsed;
		} else {
			updates.salaryMin = null;
		}
	}
	if (formData.has("salaryMax")) {
		const v = formData.get("salaryMax");
		if (typeof v === "string" && v) {
			const parsed = parseInt(v);
			if (isNaN(parsed)) {
				return data({ error: "salaryMax must be a number" }, { status: 400 });
			}
			updates.salaryMax = parsed;
		} else {
			updates.salaryMax = null;
		}
	}
	if (formData.has("salaryCurrency")) {
		const v = formData.get("salaryCurrency");
		if (typeof v === "string" && v.trim()) {
			updates.salaryCurrency = v.trim();
		}
	}
	if (formData.has("notes")) {
		const v = formData.get("notes");
		updates.notes = typeof v === "string" && v.trim() ? v.trim() : null;
	}

	// Cross-field salary validation (merge with existing DB values)
	const effectiveMin = updates.salaryMin !== undefined ? updates.salaryMin : app.salaryMin;
	const effectiveMax = updates.salaryMax !== undefined ? updates.salaryMax : app.salaryMax;
	if (
		typeof effectiveMin === "number" &&
		typeof effectiveMax === "number" &&
		effectiveMin > effectiveMax
	) {
		return data({ error: "salaryMin must be <= salaryMax" }, { status: 400 });
	}

	await db
		.update(application)
		.set(updates)
		.where(eq(application.id, applicationId));

	return data({ ok: true });
}

async function handleDelete(userId: string, formData: FormData) {
	const applicationId = formData.get("applicationId");
	if (typeof applicationId !== "string") {
		return data({ error: "applicationId is required" }, { status: 400 });
	}

	// Verify ownership and get columnId for position rewrite
	const [app] = await db
		.select({ id: application.id, columnId: application.columnId })
		.from(application)
		.where(
			and(eq(application.id, applicationId), eq(application.userId, userId)),
		);

	if (!app) {
		return data({ error: "Application not found" }, { status: 404 });
	}

	await db.delete(application).where(eq(application.id, applicationId));

	// Rewrite positions for remaining apps in the same column
	const remainingApps = await db
		.select({ id: application.id })
		.from(application)
		.where(eq(application.columnId, app.columnId))
		.orderBy(asc(application.position));

	if (remainingApps.length > 0) {
		const positionUpdates = remainingApps.map((a, i) =>
			db.update(application).set({ position: i }).where(eq(application.id, a.id)),
		) as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]];
		await db.batch(positionUpdates);
	}

	return data({ ok: true });
}

async function handleMove(userId: string, formData: FormData) {
	const applicationId = formData.get("applicationId");
	const toColumnId = formData.get("toColumnId");
	const newPositionStr = formData.get("newPosition");

	if (typeof applicationId !== "string") {
		return data({ error: "applicationId is required" }, { status: 400 });
	}
	if (typeof toColumnId !== "string") {
		return data({ error: "toColumnId is required" }, { status: 400 });
	}
	if (typeof newPositionStr !== "string" || !/^\d+$/.test(newPositionStr)) {
		return data({ error: "newPosition must be a non-negative integer" }, { status: 400 });
	}

	// Verify ownership of application
	const [app] = await db
		.select({ id: application.id, columnId: application.columnId })
		.from(application)
		.where(
			and(eq(application.id, applicationId), eq(application.userId, userId)),
		);

	if (!app) {
		return data({ error: "Application not found" }, { status: 404 });
	}

	// Verify ownership of target column
	const [targetColumn] = await db
		.select({ id: boardColumn.id })
		.from(boardColumn)
		.where(and(eq(boardColumn.id, toColumnId), eq(boardColumn.userId, userId)));

	if (!targetColumn) {
		return data({ error: "Target column not found" }, { status: 404 });
	}

	const fromColumnId = app.columnId;
	const isCrossColumn = fromColumnId !== toColumnId;
	const now = new Date();
	const statements: BatchItem<"sqlite">[] = [];

	if (isCrossColumn) {
		// Get apps in source column (excluding the moved app)
		const sourceApps = await db
			.select({ id: application.id })
			.from(application)
			.where(eq(application.columnId, fromColumnId))
			.orderBy(asc(application.position));

		const filteredSourceApps = sourceApps.filter((a) => a.id !== applicationId);

		// Rewrite source column positions
		for (let i = 0; i < filteredSourceApps.length; i++) {
			statements.push(
				db.update(application).set({ position: i }).where(eq(application.id, filteredSourceApps[i].id)),
			);
		}

		// Get apps in target column
		const targetApps = await db
			.select({ id: application.id })
			.from(application)
			.where(eq(application.columnId, toColumnId))
			.orderBy(asc(application.position));

		// Clamp new position
		const clampedPosition = Math.max(0, Math.min(parseInt(newPositionStr), targetApps.length));

		// Insert the moved app at the new position
		const newTargetOrder = [...targetApps];
		newTargetOrder.splice(clampedPosition, 0, { id: applicationId });

		// Rewrite target column positions
		for (let i = 0; i < newTargetOrder.length; i++) {
			if (newTargetOrder[i].id === applicationId) {
				statements.push(
					db.update(application)
						.set({ columnId: toColumnId, position: i, updatedAt: now })
						.where(eq(application.id, applicationId)),
				);
			} else {
				statements.push(
					db.update(application).set({ position: i }).where(eq(application.id, newTargetOrder[i].id)),
				);
			}
		}

		// Record transition
		statements.push(
			db.insert(columnTransition).values({
				applicationId,
				fromColumnId,
				toColumnId,
				transitionedAt: now,
			}),
		);
	} else {
		// Same-column reorder
		const columnApps = await db
			.select({ id: application.id })
			.from(application)
			.where(eq(application.columnId, toColumnId))
			.orderBy(asc(application.position));

		const currentIndex = columnApps.findIndex((a) => a.id === applicationId);
		const clampedPosition = Math.max(0, Math.min(parseInt(newPositionStr), columnApps.length - 1));

		const [removed] = columnApps.splice(currentIndex, 1);
		columnApps.splice(clampedPosition, 0, removed);

		for (let i = 0; i < columnApps.length; i++) {
			statements.push(
				db.update(application).set({ position: i }).where(eq(application.id, columnApps[i].id)),
			);
		}
	}

	if (statements.length > 0) {
		await db.batch(
			statements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]],
		);
	}

	return data({ ok: true });
}
