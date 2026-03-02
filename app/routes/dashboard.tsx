import type { BatchItem } from "drizzle-orm/batch";
import { eq, asc, count } from "drizzle-orm";
import { data } from "react-router";
import { db } from "~/db";
import { boardColumn, application } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/dashboard";

const DEFAULT_COLUMNS = [
	{ name: "Bookmarked", color: "indigo" },
	{ name: "Applied", color: "blue" },
	{ name: "Interview", color: "amber" },
	{ name: "Offer", color: "green" },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getRequiredSession(request);
	const userId = session.user.id;

	// Check if user has any columns
	const [{ value: columnCount }] = await db
		.select({ value: count() })
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId));

	// Auto-seed default columns for new users
	if (columnCount === 0) {
		const now = new Date();
		const inserts = DEFAULT_COLUMNS.map((col, i) =>
			db.insert(boardColumn).values({
				userId,
				name: col.name,
				color: col.color,
				position: i,
				createdAt: now,
				updatedAt: now,
			}),
		) as unknown as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]];
		await db.batch(inserts);
	}

	// Fetch all columns ordered by position
	const columns = await db
		.select()
		.from(boardColumn)
		.where(eq(boardColumn.userId, userId))
		.orderBy(asc(boardColumn.position));

	// Fetch all applications ordered by position
	const applications = await db
		.select()
		.from(application)
		.where(eq(application.userId, userId))
		.orderBy(asc(application.position));

	// Group applications by columnId
	const appsByColumn = new Map<string, typeof applications>();
	for (const app of applications) {
		const list = appsByColumn.get(app.columnId) ?? [];
		list.push(app);
		appsByColumn.set(app.columnId, list);
	}

	return data({
		columns: columns.map((col) => ({
			...col,
			applications: appsByColumn.get(col.id) ?? [],
		})),
	});
}

export function meta({}: Route.MetaArgs) {
	return [{ title: "Dashboard — dear applicant" }];
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { columns } = loaderData;

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
			<h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
				Dashboard
			</h1>
			<p className="mt-2 text-stone-500 dark:text-stone-400">
				{columns.length} column{columns.length !== 1 ? "s" : ""} loaded.
			</p>
		</div>
	);
}
