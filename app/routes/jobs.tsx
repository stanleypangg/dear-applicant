import { eq, and, like, or, desc, sql, isNotNull } from "drizzle-orm";
import { db } from "~/db";
import { jobListing } from "~/db/schema";
import { getRequiredSession } from "~/lib/auth.server";
import type { Route } from "./+types/jobs";

const PAGE_SIZE = 25;

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

// Placeholder component — UI will be built in Task 5
export default function Jobs() {
	return <div>Jobs page — UI coming soon</div>;
}
