import type { BatchItem } from "drizzle-orm/batch";
import { eq, asc, count } from "drizzle-orm";
import { data } from "react-router";
import { MoreHorizontal, Plus } from "lucide-react";
import { db } from "~/db";
import { boardColumn, application } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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

const COLUMN_COLORS: Record<string, string> = {
	indigo: "#6366F1",
	blue: "#3B82F6",
	amber: "#F59E0B",
	green: "#22C55E",
	teal: "#14B8A6",
	purple: "#A855F7",
	pink: "#EC4899",
	orange: "#F97316",
	red: "#EF4444",
};

type Column = Route.ComponentProps["loaderData"]["columns"][number];
type Application = Column["applications"][number];

function ApplicationCard({
	app,
	colorHex,
}: {
	app: Application;
	colorHex: string;
}) {
	return (
		<div
			role="button"
			aria-label={`${app.company}, ${app.role}`}
			className="rounded-lg border bg-white dark:bg-warmgray-800 p-3 cursor-pointer hover:border-warmgray-300 dark:hover:border-warmgray-600 transition-colors"
			style={{ borderLeft: `3px solid ${colorHex}` }}
		>
			<p className="text-sm font-medium text-warmgray-900 dark:text-warmgray-100 truncate">
				{app.company}
			</p>
			<p className="text-xs text-warmgray-500 dark:text-warmgray-400 truncate">
				{app.role}
			</p>
		</div>
	);
}

function KanbanColumn({ column }: { column: Column }) {
	const colorHex = COLUMN_COLORS[column.color] ?? "#6B7280";

	return (
		<section
			aria-label={`${column.name} column, ${column.applications.length} applications`}
			className="w-72 shrink-0 flex flex-col rounded-xl border bg-warmgray-50 dark:bg-warmgray-900 max-h-[calc(100vh-8rem)]"
		>
			{/* Header */}
			<div className="flex items-center gap-2 px-3 py-2.5 border-b border-warmgray-200 dark:border-warmgray-700">
				<span
					className="h-3 w-3 rounded-full shrink-0"
					style={{ backgroundColor: colorHex }}
				/>
				<h3 className="text-sm font-semibold text-warmgray-900 dark:text-warmgray-100 truncate">
					{column.name}
				</h3>
				<span className="text-xs text-warmgray-400">
					{column.applications.length}
				</span>
				<div className="ml-auto">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon-xs">
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Rename</DropdownMenuItem>
							<DropdownMenuItem>Change Color</DropdownMenuItem>
							<DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Card area */}
			<div className="flex-1 overflow-y-auto p-2 space-y-2">
				{column.applications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
						<p className="text-xs text-warmgray-400">No applications</p>
						<button
							type="button"
							className="mt-2 text-xs text-teal-700 dark:text-teal-500 hover:underline"
						>
							Add one
						</button>
					</div>
				) : (
					column.applications.map((app) => (
						<ApplicationCard key={app.id} app={app} colorHex={colorHex} />
					))
				)}
			</div>

			{/* Footer */}
			<div className="px-2 pb-2 border-t border-warmgray-200 dark:border-warmgray-700">
				<Button
					variant="ghost"
					size="sm"
					className="w-full justify-start text-warmgray-500 hover:text-warmgray-700 dark:text-warmgray-400 dark:hover:text-warmgray-200"
				>
					<Plus className="size-4" />
					Add
				</Button>
			</div>
		</section>
	);
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
	const { columns } = loaderData;

	return (
		<div className="flex h-full flex-col">
			{/* Board toolbar */}
			<div className="flex items-center justify-between px-6 py-4">
				<h1 className="text-lg font-semibold text-warmgray-900 dark:text-warmgray-100">
					Board
				</h1>
				<Button variant="outline" size="sm">
					<Plus className="size-4" />
					Add Column
				</Button>
			</div>

			{/* Kanban columns */}
			<div className="flex gap-4 px-6 pb-6 overflow-x-auto flex-1">
				{columns.map((col) => (
					<KanbanColumn key={col.id} column={col} />
				))}
			</div>
		</div>
	);
}
