import { eq, and, like, or, desc, sql, isNotNull } from "drizzle-orm";
import { Link, useSearchParams } from "react-router";
import { db } from "~/db";
import { jobListing } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/jobs";

const PAGE_SIZE = 25;

export function meta({}: Route.MetaArgs) {
	return [{ title: "Job Board — dear applicant" }];
}

export async function loader({ request }: Route.LoaderArgs) {
	await getRequiredSession(request);

	const url = new URL(request.url);
	const q = url.searchParams.get("q")?.trim() || "";
	const category = url.searchParams.get("category") || "";
	const sponsorship = url.searchParams.get("sponsorship") || "";
	const location = url.searchParams.get("location")?.trim() || "";
	const showInactive = url.searchParams.get("active") === "all";
	const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);

	const conditions = [];

	if (!showInactive) {
		conditions.push(eq(jobListing.active, true));
	}
	if (q) {
		conditions.push(
			or(
				like(jobListing.company, `%${q}%`),
				like(jobListing.title, `%${q}%`),
			),
		);
	}
	if (category) {
		conditions.push(eq(jobListing.category, category));
	}
	if (sponsorship) {
		conditions.push(eq(jobListing.sponsorship, sponsorship));
	}
	if (location) {
		conditions.push(like(jobListing.locations, `%${location}%`));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const [jobs, [{ total }]] = await Promise.all([
		db
			.select()
			.from(jobListing)
			.where(where)
			.orderBy(desc(jobListing.datePosted))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE),
		db
			.select({ total: sql<number>`count(*)` })
			.from(jobListing)
			.where(where),
	]);

	// Get distinct categories and sponsorship values for filter dropdowns
	const [categories, sponsorships] = await Promise.all([
		db
			.selectDistinct({ value: jobListing.category })
			.from(jobListing)
			.where(isNotNull(jobListing.category)),
		db
			.selectDistinct({ value: jobListing.sponsorship })
			.from(jobListing)
			.where(isNotNull(jobListing.sponsorship)),
	]);

	// Find latest updatedAt as "last synced" indicator
	const [latest] = await db
		.select({ lastSynced: sql<number>`max(${jobListing.updatedAt})` })
		.from(jobListing);

	return {
		jobs,
		total,
		page,
		pageSize: PAGE_SIZE,
		filters: { q, category, sponsorship, location, showInactive },
		categories: categories.map((c) => c.value).filter(Boolean) as string[],
		sponsorships: sponsorships.map((s) => s.value).filter(Boolean) as string[],
		lastSynced: latest?.lastSynced ?? null,
	};
}

function parseLocations(locationsJson: string): string[] {
	try {
		const parsed = JSON.parse(locationsJson);
		if (Array.isArray(parsed)) return parsed;
		return [String(parsed)];
	} catch {
		return [locationsJson];
	}
}

function formatDate(date: Date | null): string {
	if (!date) return "";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
}

function formatTimeAgo(timestamp: number): string {
	const now = Date.now();
	const diffMs = now - timestamp * 1000;
	const diffMinutes = Math.floor(diffMs / 60_000);
	const diffHours = Math.floor(diffMs / 3_600_000);
	const diffDays = Math.floor(diffMs / 86_400_000);

	if (diffMinutes < 1) return "just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 30) return `${diffDays}d ago`;
	return formatDate(new Date(timestamp * 1000));
}

function buildPageUrl(
	searchParams: URLSearchParams,
	page: number,
): string {
	const params = new URLSearchParams(searchParams);
	if (page <= 1) {
		params.delete("page");
	} else {
		params.set("page", String(page));
	}
	const qs = params.toString();
	return qs ? `/jobs?${qs}` : "/jobs";
}

export default function Jobs({ loaderData }: Route.ComponentProps) {
	const {
		jobs,
		total,
		page,
		pageSize,
		filters,
		categories,
		sponsorships,
		lastSynced,
	} = loaderData;

	const [searchParams] = useSearchParams();
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const hasNextPage = page < totalPages;
	const hasPrevPage = page > 1;

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
			{/* Page header */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
					Job Board
				</h1>
				<p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
					Browse and search job listings. Add any to your tracking board.
				</p>
			</div>

			{/* Filter form */}
			<form
				method="get"
				action="/jobs"
				className="mb-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 p-4"
			>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
						<Label
							htmlFor="q"
							className="text-stone-700 dark:text-stone-300"
						>
							Search
						</Label>
						<Input
							id="q"
							name="q"
							type="search"
							placeholder="Company or job title..."
							defaultValue={filters.q}
							className="border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
						/>
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="location"
							className="text-stone-700 dark:text-stone-300"
						>
							Location
						</Label>
						<Input
							id="location"
							name="location"
							type="text"
							placeholder="e.g. New York, Remote"
							defaultValue={filters.location}
							className="border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
						/>
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="category"
							className="text-stone-700 dark:text-stone-300"
						>
							Category
						</Label>
						<select
							id="category"
							name="category"
							defaultValue={filters.category}
							className="h-9 w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors"
						>
							<option value="">All categories</option>
							{categories.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<Label
							htmlFor="sponsorship"
							className="text-stone-700 dark:text-stone-300"
						>
							Sponsorship
						</Label>
						<select
							id="sponsorship"
							name="sponsorship"
							defaultValue={filters.sponsorship}
							className="h-9 w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:ring-teal-500/30 dark:focus:border-teal-500 transition-colors"
						>
							<option value="">All sponsorship types</option>
							{sponsorships.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-end gap-4 sm:col-span-2 lg:col-span-3">
						<label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 cursor-pointer select-none">
							<input
								type="checkbox"
								name="active"
								value="all"
								defaultChecked={filters.showInactive}
								className="size-4 rounded border-stone-300 dark:border-stone-600 text-teal-600 focus:ring-teal-500 cursor-pointer"
							/>
							Show inactive listings
						</label>
					</div>

					<div className="flex items-end justify-end">
						<Button
							type="submit"
							className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-600 w-full sm:w-auto"
						>
							Search
						</Button>
					</div>
				</div>
			</form>

			{/* Results summary */}
			{total > 0 && (
				<p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
					Showing{" "}
					<span className="font-medium text-stone-700 dark:text-stone-300">
						{(page - 1) * pageSize + 1}
					</span>
					{" "}&ndash;{" "}
					<span className="font-medium text-stone-700 dark:text-stone-300">
						{Math.min(page * pageSize, total)}
					</span>
					{" "}of{" "}
					<span className="font-medium text-stone-700 dark:text-stone-300">
						{total}
					</span>
					{" "}results
					{page > 1 && (
						<>
							{" "}&middot; Page {page} of {totalPages}
						</>
					)}
				</p>
			)}

			{/* Job cards or empty state */}
			{jobs.length === 0 ? (
				<div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 py-16 text-center">
					<div className="mx-auto max-w-sm">
						<p className="text-lg font-medium text-stone-700 dark:text-stone-300">
							No jobs found
						</p>
						<p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
							{filters.q || filters.category || filters.sponsorship || filters.location
								? "No jobs match your current filters. Try broadening your search."
								: "No jobs have been synced yet. Check back soon."}
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-3">
					{jobs.map((job) => {
						const locations = parseLocations(job.locations);
						return (
							<div
								key={job.id}
								className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 p-4 transition-colors hover:border-stone-300 dark:hover:border-stone-700"
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									{/* Job info */}
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-semibold text-stone-900 dark:text-stone-100">
												{job.company}
											</span>
											{!job.active && (
												<Badge
													variant="secondary"
													className="bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500"
												>
													Inactive
												</Badge>
											)}
										</div>
										<p className="mt-0.5 text-sm text-stone-700 dark:text-stone-300">
											{job.title}
										</p>
										<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
											{locations.length > 0 && (
												<span title={locations.join(", ")}>
													{locations.join(", ")}
												</span>
											)}
											{job.category && (
												<Badge
													variant="outline"
													className="text-xs text-stone-600 dark:text-stone-400"
												>
													{job.category}
												</Badge>
											)}
											{job.sponsorship && (
												<Badge
													variant="outline"
													className="text-xs text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800"
												>
													{job.sponsorship}
												</Badge>
											)}
											{job.datePosted && (
												<span>
													Posted {formatDate(job.datePosted)}
												</span>
											)}
										</div>
									</div>

									{/* Actions */}
									<div className="flex shrink-0 items-center gap-2">
										<a
											href={job.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex h-8 items-center justify-center rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
										>
											Apply
										</a>
										<Link
											to={`/dashboard?addJob=true&company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}&url=${encodeURIComponent(job.url)}`}
											className="inline-flex h-8 items-center justify-center rounded-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 px-3 text-sm font-medium text-white transition-colors"
										>
											Add to board
										</Link>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<nav
					className="mt-6 flex items-center justify-between"
					aria-label="Pagination"
				>
					<div className="text-sm text-stone-500 dark:text-stone-400">
						Page {page} of {totalPages}
					</div>
					<div className="flex items-center gap-2">
						{hasPrevPage ? (
							<Link
								to={buildPageUrl(searchParams, page - 1)}
								className="inline-flex h-9 items-center justify-center rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
							>
								Previous
							</Link>
						) : (
							<span className="inline-flex h-9 items-center justify-center rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 text-sm font-medium text-stone-400 dark:text-stone-600 cursor-not-allowed">
								Previous
							</span>
						)}
						{hasNextPage ? (
							<Link
								to={buildPageUrl(searchParams, page + 1)}
								className="inline-flex h-9 items-center justify-center rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
							>
								Next
							</Link>
						) : (
							<span className="inline-flex h-9 items-center justify-center rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 text-sm font-medium text-stone-400 dark:text-stone-600 cursor-not-allowed">
								Next
							</span>
						)}
					</div>
				</nav>
			)}

			{/* Footer — last synced */}
			<div className="mt-8 border-t border-stone-200 dark:border-stone-800 pt-4">
				<p className="text-xs text-stone-400 dark:text-stone-500">
					{lastSynced
						? `Last synced: ${formatTimeAgo(lastSynced)}`
						: "No sync data yet"}
				</p>
			</div>
		</div>
	);
}
