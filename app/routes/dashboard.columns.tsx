import type { BatchItem } from "drizzle-orm/batch";
import type { InferInsertModel } from "drizzle-orm";
import { eq, and, asc, count } from "drizzle-orm";
import { data } from "react-router";
import { db } from "~/db";
import { boardColumn, application } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/dashboard.columns";

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
		case "reorder":
			return handleReorder(userId, formData);
		default:
			return data({ error: "Unknown intent" }, { status: 400 });
	}
}

async function handleCreate(userId: string, formData: FormData) {
	const name = formData.get("name");
	const color = formData.get("color");

	if (typeof name !== "string" || !name.trim()) {
		return data({ error: "Name is required" }, { status: 400 });
	}
	if (typeof color !== "string" || !color.trim()) {
		return data({ error: "Color is required" }, { status: 400 });
	}

	const [{ value: position }] = await db
		.select({ value: count() })
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId));

	const now = new Date();
	const result = await db
		.insert(boardColumn)
		.values({
			userId,
			name: name.trim(),
			color: color.trim(),
			position,
			createdAt: now,
			updatedAt: now,
		})
		.returning({ id: boardColumn.id });

	return data({ id: result[0].id }, { status: 201 });
}

async function handleUpdate(userId: string, formData: FormData) {
	const columnId = formData.get("columnId");
	if (typeof columnId !== "string") {
		return data({ error: "columnId is required" }, { status: 400 });
	}

	// Verify ownership
	const [column] = await db
		.select({ id: boardColumn.id })
		.from(boardColumn)
		.where(and(eq(boardColumn.id, columnId), eq(boardColumn.userId, userId)));

	if (!column) {
		return data({ error: "Column not found" }, { status: 404 });
	}

	const updates: Partial<InferInsertModel<typeof boardColumn>> = { updatedAt: new Date() };
	if (formData.has("name")) {
		const name = formData.get("name");
		if (typeof name !== "string" || !name.trim()) {
			return data({ error: "Name cannot be empty" }, { status: 400 });
		}
		updates.name = name.trim();
	}
	if (formData.has("color")) {
		const color = formData.get("color");
		if (typeof color !== "string" || !color.trim()) {
			return data({ error: "Color cannot be empty" }, { status: 400 });
		}
		updates.color = color.trim();
	}

	await db
		.update(boardColumn)
		.set(updates)
		.where(eq(boardColumn.id, columnId));

	return data({ ok: true });
}

async function handleDelete(userId: string, formData: FormData) {
	const columnId = formData.get("columnId");
	if (typeof columnId !== "string") {
		return data({ error: "columnId is required" }, { status: 400 });
	}

	// Verify ownership
	const [column] = await db
		.select({ id: boardColumn.id })
		.from(boardColumn)
		.where(and(eq(boardColumn.id, columnId), eq(boardColumn.userId, userId)));

	if (!column) {
		return data({ error: "Column not found" }, { status: 404 });
	}

	// Count apps in this column
	const [{ value: appCount }] = await db
		.select({ value: count() })
		.from(application)
		.where(eq(application.columnId, columnId));

	if (appCount > 0) {
		const destinationColumnId = formData.get("destinationColumnId");
		if (typeof destinationColumnId !== "string") {
			return data(
				{ error: "destinationColumnId is required when column has applications" },
				{ status: 400 },
			);
		}

		// Verify ownership of destination
		const [destColumn] = await db
			.select({ id: boardColumn.id })
			.from(boardColumn)
			.where(
				and(
					eq(boardColumn.id, destinationColumnId),
					eq(boardColumn.userId, userId),
				),
			);

		if (!destColumn) {
			return data({ error: "Destination column not found" }, { status: 404 });
		}

		// Get apps in source column to move individually with correct positions
		const appsToMove = await db
			.select({ id: application.id })
			.from(application)
			.where(eq(application.columnId, columnId))
			.orderBy(asc(application.position));

		// Count apps in destination for position offset
		const [{ value: destAppCount }] = await db
			.select({ value: count() })
			.from(application)
			.where(eq(application.columnId, destinationColumnId));

		// Move each app with incrementing positions, then delete column
		const now = new Date();
		const statements = appsToMove.map((app, i) =>
			db.update(application)
				.set({ columnId: destinationColumnId, position: destAppCount + i, updatedAt: now })
				.where(eq(application.id, app.id)),
		);
		statements.push(
			db.delete(boardColumn).where(eq(boardColumn.id, columnId)) as any,
		);
		await db.batch(
			statements as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]],
		);
	} else {
		await db.delete(boardColumn).where(eq(boardColumn.id, columnId));
	}

	// Rewrite positions for remaining columns
	const remainingColumns = await db
		.select({ id: boardColumn.id })
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId))
		.orderBy(asc(boardColumn.position));

	if (remainingColumns.length > 0) {
		const positionUpdates = remainingColumns.map((col, i) =>
			db.update(boardColumn).set({ position: i }).where(eq(boardColumn.id, col.id)),
		) as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]];
		await db.batch(positionUpdates);
	}

	return data({ ok: true });
}

async function handleReorder(userId: string, formData: FormData) {
	const columnId = formData.get("columnId");
	const newPositionStr = formData.get("newPosition");

	if (typeof columnId !== "string") {
		return data({ error: "columnId is required" }, { status: 400 });
	}
	if (typeof newPositionStr !== "string" || !/^\d+$/.test(newPositionStr)) {
		return data({ error: "newPosition must be a non-negative integer" }, { status: 400 });
	}

	// Get all user columns ordered by position
	const columns = await db
		.select({ id: boardColumn.id })
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId))
		.orderBy(asc(boardColumn.position));

	const currentIndex = columns.findIndex((c) => c.id === columnId);
	if (currentIndex === -1) {
		return data({ error: "Column not found" }, { status: 404 });
	}

	// Remove from current position and insert at new position (clamped)
	const newPosition = Math.max(0, Math.min(parseInt(newPositionStr), columns.length - 1));
	const [removed] = columns.splice(currentIndex, 1);
	columns.splice(newPosition, 0, removed);

	// Rewrite all positions
	const updates = columns.map((col, i) =>
		db.update(boardColumn).set({ position: i }).where(eq(boardColumn.id, col.id)),
	) as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]];
	await db.batch(updates);

	return data({ ok: true });
}
